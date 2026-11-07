/**
 * Reset User Password Script
 *
 * Safely resets a specific user's password to DEFAULT_TEMP_PASSWORD (cost 12)
 * and flags them with mustChangePassword = true.
 *
 * SAFETY REQUIREMENTS:
 * - Requires CONFIRM_DB_HOST matching the database host in DATABASE_URL.
 * - Refuses to touch an ADMIN account without the explicit --allow-admin flag.
 * - Requires DEFAULT_TEMP_PASSWORD env var (>= 8 characters).
 * - Masks email addresses in output.
 *
 * Usage:
 *   CONFIRM_DB_HOST="ep-xxxx.neon.tech" DEFAULT_TEMP_PASSWORD="SecureTempPassword123!" npx tsx scripts/reset-user-password.ts <userId-or-email> [--allow-admin]
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

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
            `Please run with CONFIRM_DB_HOST="${actualHost}" to verify target database.`
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

    const args = process.argv.slice(2)
    const allowAdmin = args.includes("--allow-admin")
    const targetIdentifier = args.find((a) => !a.startsWith("--"))?.trim()

    if (!targetIdentifier) {
        console.error("❌ Usage: npx tsx scripts/reset-user-password.ts <userId-or-email> [--allow-admin]")
        process.exit(1)
    }

    const tempPassword = process.env.DEFAULT_TEMP_PASSWORD?.trim()
    if (!tempPassword || tempPassword.length < 8) {
        console.error("❌ ERROR: DEFAULT_TEMP_PASSWORD environment variable must be set and at least 8 characters.")
        process.exit(1)
    }

    const prisma = new PrismaClient()

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: targetIdentifier },
                    { email: targetIdentifier.toLowerCase() },
                ],
            },
        })

        if (!user) {
            console.error(`❌ User not found for identifier: ${targetIdentifier}`)
            process.exit(1)
        }

        if (user.role === "ADMIN" && !allowAdmin) {
            console.error(
                `⛔ REFUSED: Target user ${user.id} has role ADMIN.\n` +
                `Resetting an ADMIN password requires passing the explicit --allow-admin flag.`
            )
            process.exit(1)
        }

        const hashedPassword = await bcrypt.hash(tempPassword, 12)

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: true,
            },
        })

        console.log("✅ Password successfully reset!")
        console.log(`User ID:             ${updated.id}`)
        console.log(`Masked Email:        ${maskEmail(updated.email)}`)
        console.log(`Role:                ${updated.role}`)
        console.log(`Status:              ${updated.status}`)
        console.log(`mustChangePassword:  ${updated.mustChangePassword}`)
        console.log("Password hash has been updated with bcrypt cost 12.")
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err.message)
    process.exit(1)
})
