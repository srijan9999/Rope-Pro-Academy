/**
 * Detect Fallback Encrypted Data Script (READ-ONLY)
 *
 * Scans database tables (Coach, Student) for PII fields encrypted using
 * the obsolete hardcoded fallback key (0123456789abcdef...).
 *
 * SAFETY REQUIREMENTS:
 * - Requires CONFIRM_ENDPOINT_ID matching the Neon endpoint ID of DATABASE_URL.
 * - Read-only: zero writes, updates, or deletions.
 * - Does not print plaintext decrypted secrets to stdout.
 *
 * Usage (PowerShell):
 *   $env:CONFIRM_ENDPOINT_ID = "<endpoint-id>"
 *   npx tsx scripts/detect-fallback-encrypted-data.ts
 *   Remove-Item Env:\CONFIRM_ENDPOINT_ID
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
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("❌ ERROR: DATABASE_URL is not set.")
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

function canDecryptWithFallback(ciphertext: string | null): boolean {
    if (!ciphertext || !ciphertext.includes(":")) return false
    const parts = ciphertext.split(":")
    if (parts.length !== 2 || parts[0].length !== 32) return false

    try {
        const iv = Buffer.from(parts[0], "hex")
        const encrypted = parts[1]
        const decipher = crypto.createDecipheriv("aes-256-cbc", FALLBACK_KEY, iv)
        let decrypted = decipher.update(encrypted, "hex", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted.length > 0
    } catch {
        return false
    }
}

async function main() {
    verifyHostGuard()

    const prisma = new PrismaClient()

    try {
        console.log("🔍 Scanning for records encrypted with legacy fallback key...")

        // 1. Scan Coaches
        const coaches = await prisma.coach.findMany({
            select: { id: true, coachId: true, phone: true },
        })

        let coachFallbackCount = 0
        for (const c of coaches) {
            if (canDecryptWithFallback(c.phone)) {
                coachFallbackCount++
                console.log(`[Coach] ID: ${c.id} (${c.coachId}) has phone encrypted with fallback key.`)
            }
        }

        // 2. Scan Students
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

        let studentFallbackCount = 0
        for (const s of students) {
            const affectedFields: string[] = []
            if (canDecryptWithFallback(s.phone)) affectedFields.push("phone")
            if (canDecryptWithFallback(s.emergencyContact)) affectedFields.push("emergencyContact")
            if (canDecryptWithFallback(s.medicalConditions)) affectedFields.push("medicalConditions")
            if (canDecryptWithFallback(s.parentPhone)) affectedFields.push("parentPhone")

            if (affectedFields.length > 0) {
                studentFallbackCount++
                console.log(`[Student] ID: ${s.id} (${s.studentId}) fields using fallback key: ${affectedFields.join(", ")}`)
            }
        }

        console.log("\n=== Summary ===")
        console.log(`Coaches affected: ${coachFallbackCount} / ${coaches.length}`)
        console.log(`Students affected: ${studentFallbackCount} / ${students.length}`)

        if (coachFallbackCount === 0 && studentFallbackCount === 0) {
            console.log("✅ Clean: No records in the target database use the legacy fallback key.")
        } else {
            console.log("⚠️ Action required: Run scripts/reencrypt-data.ts with new ENCRYPTION_KEY to re-encrypt affected records.")
        }
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err.message)
    process.exit(1)
})
