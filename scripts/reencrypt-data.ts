/**
 * Re-Encrypt Data Script
 *
 * Migrates PII fields in Coach and Student records from the legacy fallback key
 * to a new securely generated ENCRYPTION_KEY.
 *
 * SAFETY REQUIREMENTS:
 * - Requires CONFIRM_ENDPOINT_ID matching the Neon endpoint ID of DATABASE_URL.
 * - Requires ENCRYPTION_KEY set to a new 64-character hex string (32 bytes).
 * - Supports --dry-run flag to preview changes without modifying records.
 *
 * Usage (PowerShell):
 *   $env:CONFIRM_ENDPOINT_ID = "<endpoint-id>"
 *   $env:ENCRYPTION_KEY = "<new-64-char-hex-key>"
 *   npx tsx scripts/reencrypt-data.ts [--dry-run]
 *   Remove-Item Env:\CONFIRM_ENDPOINT_ID, Env:\ENCRYPTION_KEY
 */

import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const FALLBACK_KEY_HEX = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
const FALLBACK_KEY = Buffer.from(FALLBACK_KEY_HEX, "hex")

function getNormalizedEndpointId(dbUrlStr: string): string {
    const match = dbUrlStr.match(/ep-[a-z0-9-]+/)
    if (!match) return ""
    return match[0].replace(/-pooler$/, "")
}

function verifyHostGuard(): void {
    const dbUrl = process.env.DATABASE_URL || process.env.LIVE_DATABASE_URL
    if (!dbUrl) {
        console.error("❌ ERROR: Neither DATABASE_URL nor LIVE_DATABASE_URL is set.")
        process.exit(1)
    }

    const actualEndpoint = getNormalizedEndpointId(dbUrl)
    const confirmed = process.env.CONFIRM_ENDPOINT_ID?.trim()

    if (!confirmed) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_ENDPOINT_ID is not set.\n` +
            `Please run with CONFIRM_ENDPOINT_ID="${actualEndpoint}" to proceed.`
        )
        process.exit(1)
    }

    if (confirmed !== actualEndpoint) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_ENDPOINT_ID ('${confirmed}') does not match actual endpoint ('${actualEndpoint}'). Aborting.`
        )
        process.exit(1)
    }
}

function getNewKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY?.trim()
    if (!key || key.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(key)) {
        console.error("❌ ERROR: ENCRYPTION_KEY must be a 64-character hexadecimal string.")
        process.exit(1)
    }
    if (key.toLowerCase() === FALLBACK_KEY_HEX.toLowerCase()) {
        console.error("❌ ERROR: New ENCRYPTION_KEY cannot be identical to the legacy fallback key.")
        process.exit(1)
    }
    return Buffer.from(key, "hex")
}

function decryptWithFallback(ciphertext: string | null): string | null {
    if (!ciphertext || !ciphertext.includes(":")) return null
    const parts = ciphertext.split(":")
    if (parts.length !== 2 || parts[0].length !== 32) return null

    try {
        const iv = Buffer.from(parts[0], "hex")
        const encrypted = parts[1]
        const decipher = crypto.createDecipheriv("aes-256-cbc", FALLBACK_KEY, iv)
        let decrypted = decipher.update(encrypted, "hex", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    } catch {
        return null
    }
}

function encryptWithNewKey(plaintext: string, newKey: Buffer): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", newKey, iv)
    let encrypted = cipher.update(plaintext, "utf8", "hex")
    encrypted += cipher.final("hex")
    return iv.toString("hex") + ":" + encrypted
}

async function main() {
    verifyHostGuard()
    const newKey = getNewKey()

    const isDryRun = process.argv.includes("--dry-run")
    if (isDryRun) {
        console.log("ℹ️ Running in DRY-RUN mode. No database updates will be committed.")
    }

    const prisma = new PrismaClient()

    try {
        let coachesUpdated = 0
        let studentsUpdated = 0

        // 1. Process Coaches
        const coaches = await prisma.coach.findMany({
            select: { id: true, coachId: true, phone: true },
        })

        for (const coach of coaches) {
            const decryptedPhone = decryptWithFallback(coach.phone)
            if (decryptedPhone) {
                const reencryptedPhone = encryptWithNewKey(decryptedPhone, newKey)
                if (!isDryRun) {
                    await prisma.coach.update({
                        where: { id: coach.id },
                        data: { phone: reencryptedPhone },
                    })
                }
                coachesUpdated++
            }
        }

        // 2. Process Students
        const students = await prisma.student.findMany({
            select: {
                id: true,
                studentId: true,
                phone: true,
                emergencyContact: true,
                medicalConditions: true,
                parentPhone: true,
            },
        })

        for (const student of students) {
            const dataToUpdate: Record<string, string> = {}

            const phone = decryptWithFallback(student.phone)
            if (phone) dataToUpdate.phone = encryptWithNewKey(phone, newKey)

            const emergency = decryptWithFallback(student.emergencyContact)
            if (emergency) dataToUpdate.emergencyContact = encryptWithNewKey(emergency, newKey)

            const medical = decryptWithFallback(student.medicalConditions)
            if (medical) dataToUpdate.medicalConditions = encryptWithNewKey(medical, newKey)

            const parentPhone = decryptWithFallback(student.parentPhone)
            if (parentPhone) dataToUpdate.parentPhone = encryptWithNewKey(parentPhone, newKey)

            if (Object.keys(dataToUpdate).length > 0) {
                if (!isDryRun) {
                    await prisma.student.update({
                        where: { id: student.id },
                        data: dataToUpdate,
                    })
                }
                studentsUpdated++
            }
        }

        console.log("\n=== Re-encryption Execution Summary ===")
        console.log(`Coaches re-encrypted: ${coachesUpdated}`)
        console.log(`Students re-encrypted: ${studentsUpdated}`)
        if (isDryRun) {
            console.log("Dry run finished successfully. Pass without --dry-run to commit changes.")
        } else {
            console.log("✅ All affected records have been securely migrated to the new key.")
        }
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err.message)
    process.exit(1)
})
