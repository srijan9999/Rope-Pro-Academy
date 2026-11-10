/**
 * Detect Fallback / Key Encrypted Data Script (READ-ONLY)
 *
 * Scans database tables (Coach, Student) for PII fields encrypted using
 * the obsolete hardcoded fallback key (0123456789abcdef...) or a candidate ENCRYPTION_KEY.
 *
 * SAFETY REQUIREMENTS:
 * - Requires CONFIRM_DB_HOST (or CONFIRM_ENDPOINT_ID) matching the Neon endpoint ID of LIVE_DATABASE_URL.
 * - Read-only: zero writes, updates, or deletions.
 * - Does not print plaintext decrypted secrets to stdout.
 *
 * Usage (PowerShell):
 *   $env:CONFIRM_DB_HOST = "<endpoint-id>"
 *   $env:ENCRYPTION_KEY = "<candidate-64-char-hex-key>" # optional: test against candidate key
 *   npx tsx scripts/detect-fallback-encrypted-data.ts
 *   Remove-Item Env:\CONFIRM_DB_HOST; if (Test-Path Env:\ENCRYPTION_KEY) { Remove-Item Env:\ENCRYPTION_KEY }
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
    const dbUrl = process.env.LIVE_DATABASE_URL || process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("❌ ERROR: Neither LIVE_DATABASE_URL nor DATABASE_URL is set.")
        process.exit(1)
    }

    const actualEndpoint = getNormalizedEndpointId(dbUrl)
    const confirmed = (process.env.CONFIRM_DB_HOST || process.env.CONFIRM_ENDPOINT_ID)?.trim()
    const confirmedNorm = confirmed ? (getNormalizedEndpointId(confirmed) || confirmed) : ""

    if (!confirmedNorm) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST is not set.\n` +
            `Please run with CONFIRM_DB_HOST="${actualEndpoint}" to verify target database.`
        )
        process.exit(1)
    }

    if (confirmedNorm !== actualEndpoint) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST ('${confirmedNorm}') does not match actual endpoint ('${actualEndpoint}'). Aborting.`
        )
        process.exit(1)
    }
}

function canDecryptWithKey(ciphertext: string | null, keyBuf: Buffer): boolean {
    if (!ciphertext || !ciphertext.includes(":")) return false
    const parts = ciphertext.split(":")
    if (parts.length !== 2 || parts[0].length !== 32) return false

    try {
        const iv = Buffer.from(parts[0], "hex")
        const encrypted = parts[1]
        const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, iv)
        let decrypted = decipher.update(encrypted, "hex", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted.length > 0
    } catch {
        return false
    }
}

async function main() {
    verifyHostGuard()

    const candidateKeyRaw = process.env.ENCRYPTION_KEY?.trim()
    let candidateKeyBuf: Buffer | null = null
    if (candidateKeyRaw) {
        if (candidateKeyRaw.length === 64 && /^[0-9a-fA-F]{64}$/.test(candidateKeyRaw)) {
            candidateKeyBuf = Buffer.from(candidateKeyRaw, "hex")
            console.log("🔑 Candidate ENCRYPTION_KEY detected (valid 64-char hex). Checking decryption with candidate key as well...")
        } else {
            console.warn("⚠️ Warning: Provided ENCRYPTION_KEY is not a valid 64-character hex string. Skipping candidate key check.")
        }
    }

    const prisma = new PrismaClient()

    try {
        console.log("🔍 Scanning for records encrypted with legacy fallback key or candidate key...")

        // 1. Scan Coaches
        const coaches = await prisma.coach.findMany({
            select: { id: true, coachId: true, phone: true },
        })

        let coachFallbackCount = 0
        let coachCandidateCount = 0
        let coachPlainCount = 0

        for (const c of coaches) {
            if (!c.phone) continue
            const isFallback = canDecryptWithKey(c.phone, FALLBACK_KEY)
            const isCandidate = candidateKeyBuf ? canDecryptWithKey(c.phone, candidateKeyBuf) : false

            if (isFallback) {
                coachFallbackCount++
                console.log(`[Coach] ID: ${c.id} (${c.coachId}) has phone encrypted with FALLBACK key.`)
            } else if (isCandidate) {
                coachCandidateCount++
                console.log(`[Coach] ID: ${c.id} (${c.coachId}) has phone encrypted with CANDIDATE key.`)
            } else if (!c.phone.includes(":")) {
                coachPlainCount++
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
        let studentCandidateCount = 0
        let studentPlainCount = 0

        for (const s of students) {
            const fields: { name: string; val: string | null }[] = [
                { name: "phone", val: s.phone },
                { name: "emergencyContact", val: s.emergencyContact },
                { name: "medicalConditions", val: s.medicalConditions },
                { name: "parentPhone", val: s.parentPhone },
            ]

            const fallbackFields: string[] = []
            const candidateFields: string[] = []

            for (const f of fields) {
                if (!f.val) continue
                if (canDecryptWithKey(f.val, FALLBACK_KEY)) {
                    fallbackFields.push(f.name)
                } else if (candidateKeyBuf && canDecryptWithKey(f.val, candidateKeyBuf)) {
                    candidateFields.push(f.name)
                } else if (!f.val.includes(":")) {
                    studentPlainCount++
                }
            }

            if (fallbackFields.length > 0) {
                studentFallbackCount++
                console.log(`[Student] ID: ${s.id} (${s.studentId}) fields using FALLBACK key: ${fallbackFields.join(", ")}`)
            }
            if (candidateFields.length > 0) {
                studentCandidateCount++
                console.log(`[Student] ID: ${s.id} (${s.studentId}) fields using CANDIDATE key: ${candidateFields.join(", ")}`)
            }
        }

        console.log("\n=== Detection Summary ===")
        console.log(`Total Coaches scanned: ${coaches.length}`)
        console.log(`  - Fallback key encrypted: ${coachFallbackCount}`)
        if (candidateKeyBuf) console.log(`  - Candidate key encrypted: ${coachCandidateCount}`)
        console.log(`Total Students scanned: ${students.length}`)
        console.log(`  - Fallback key encrypted: ${studentFallbackCount}`)
        if (candidateKeyBuf) console.log(`  - Candidate key encrypted: ${studentCandidateCount}`)

        if (coachFallbackCount === 0 && studentFallbackCount === 0) {
            console.log("✅ Clean: Zero records in target database use the legacy fallback key.")
        } else {
            console.log("⚠️ Action required: Records exist that require the fallback key or re-encryption.")
        }
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err.message)
    process.exit(1)
})
