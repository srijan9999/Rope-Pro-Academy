/**
 * Audit Live Accounts Script (READ-ONLY)
 *
 * Scans the database for users whose emails match any demo, seed, or test
 * emails from repository history, and checks if their password hashes match
 * any known seed/demo passwords passed via KNOWN_PASSWORDS.
 *
 * SAFETY REQUIREMENTS:
 * - Requires CONFIRM_DB_HOST matching the database host in DATABASE_URL.
 * - Read-only: performs zero writes, updates, or deletes.
 * - Masks all email addresses in standard output.
 *
 * Usage:
 *   CONFIRM_DB_HOST="ep-xxxx.neon.tech" KNOWN_PASSWORDS="pass1,pass2" npx tsx scripts/audit-live-accounts.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const HISTORICAL_DEMO_EMAILS = [
    "admin@ropeproacademy.com",
    "coach@roproacademy.com",
    "coach@ropeproacademy.com",
    "admin@roproacademy.com",
    "player@ropeproacademy.com",
    "student@ropeproacademy.com",
    "superadmin@ropeproacademy.com",
    "coach.vikas@ropeproacademy.com",
    "coach.rohit@ropeproacademy.com",
    "coach.priya@ropeproacademy.com",
    "coach.arun@ropeproacademy.com",
    "coach.deepak@ropeproacademy.com",
    "hacker_coach@security-test.com",
    "hacker_admin@security-test.com",
]

function maskEmail(email: string): string {
    const atIndex = email.indexOf("@")
    if (atIndex === -1) return "***"
    const local = email.slice(0, atIndex)
    const domain = email.slice(atIndex + 1)
    const dotIndex = domain.lastIndexOf(".")
    const domName = dotIndex === -1 ? domain : domain.slice(0, dotIndex)
    const tld = dotIndex === -1 ? "" : domain.slice(dotIndex)

    const maskedLocal = local.length <= 2 ? local[0] + "***" : local.slice(0, 2) + "***"
    const maskedDom = domName.length <= 1 ? domName[0] + "***" : domName[0] + "****"
    return `${maskedLocal}@${maskedDom}${tld}`
}

function verifyHostGuard(): void {
    const dbUrlStr = process.env.DATABASE_URL
    if (!dbUrlStr) {
        console.error("❌ ERROR: DATABASE_URL is not set.")
        process.exit(1)
    }

    let actualHost = ""
    try {
        const parsed = new URL(dbUrlStr)
        actualHost = parsed.host
    } catch {
        console.error("❌ ERROR: Failed to parse host from DATABASE_URL.")
        process.exit(1)
    }

    const confirmHost = process.env.CONFIRM_DB_HOST?.trim()
    if (!confirmHost) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST is not set.\n` +
            `Please run with CONFIRM_DB_HOST="${actualHost}" to verify you intend to audit this database.`
        )
        process.exit(1)
    }

    if (confirmHost !== actualHost) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST ('${confirmHost}') does not match actual database host ('${actualHost}'). Aborting.`
        )
        process.exit(1)
    }
}

async function main() {
    verifyHostGuard()

    const prisma = new PrismaClient()

    try {
        const knownPasswords = (process.env.KNOWN_PASSWORDS || "")
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)

        console.log("🔍 Scanning database for known seed/demo accounts...")
        console.log(`Checking against ${HISTORICAL_DEMO_EMAILS.length} historical email signatures.`)
        if (knownPasswords.length > 0) {
            console.log(`Checking against ${knownPasswords.length} candidate known default passwords.`)
        } else {
            console.log("ℹ️ KNOWN_PASSWORDS env var not provided. Password default match check skipped.")
        }

        const matchedUsers = await prisma.user.findMany({
            where: {
                email: {
                    in: HISTORICAL_DEMO_EMAILS,
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                password: true,
                mustChangePassword: true,
                createdAt: true,
            },
        })

        if (matchedUsers.length === 0) {
            console.log("\n✅ Clean: No historical demo/seed accounts found in this database.")
            return
        }

        console.log(`\n⚠️ Found ${matchedUsers.length} account(s) matching historical seed/demo emails:`)
        console.log("--------------------------------------------------------------------------------")

        for (const user of matchedUsers) {
            let isDefaultPassword = false
            if (knownPasswords.length > 0 && user.password) {
                for (const candidate of knownPasswords) {
                    if (await bcrypt.compare(candidate, user.password)) {
                        isDefaultPassword = true
                        break
                    }
                }
            }

            console.log(`ID:                   ${user.id}`)
            console.log(`Masked Email:         ${maskEmail(user.email)}`)
            console.log(`Role:                 ${user.role}`)
            console.log(`Status:               ${user.status}`)
            console.log(`Is Default Password:  ${knownPasswords.length > 0 ? (isDefaultPassword ? "YES (MATCHES KNOWN PASSWORD)" : "NO") : "NOT TESTED"}`)
            console.log(`mustChangePassword:   ${user.mustChangePassword ? "YES" : "NO"}`)
            console.log(`Created At:           ${user.createdAt.toISOString()}`)
            console.log("--------------------------------------------------------------------------------")
        }
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((err) => {
    console.error("❌ Unexpected error during audit:", err.message)
    process.exit(1)
})
