import "server-only"

let isAsserted = false

/**
 * Validates critical environment variables at startup.
 * Skips validation during 'next build' (NEXT_PHASE === "phase-production-build").
 * Enforces:
 * - DATABASE_URL present
 * - NEXTAUTH_SECRET >= 32 characters
 * - NEXTAUTH_URL starts with https:// in production
 * - DEFAULT_TEMP_PASSWORD >= 8 characters
 */
export function assertEnv(): void {
    if (isAsserted) return

    if (process.env.NEXT_PHASE === "phase-production-build") {
        return
    }

    const errors: string[] = []

    // 1. DATABASE_URL
    if (!process.env.DATABASE_URL?.trim()) {
        errors.push("DATABASE_URL is required but missing.")
    }

    // 2. NEXTAUTH_SECRET (>= 32 chars)
    const secret = process.env.NEXTAUTH_SECRET?.trim()
    if (!secret) {
        errors.push("NEXTAUTH_SECRET is required but missing.")
    } else if (secret.length < 32) {
        errors.push(`NEXTAUTH_SECRET must be at least 32 characters long (found ${secret.length}).`)
    }

    // 3. NEXTAUTH_URL (https in production)
    const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
    if (process.env.NODE_ENV === "production") {
        if (!nextAuthUrl) {
            errors.push("NEXTAUTH_URL is required in production.")
        } else if (!nextAuthUrl.startsWith("https://")) {
            errors.push(`NEXTAUTH_URL must start with 'https://' in production (got '${nextAuthUrl}').`)
        }
    }

    // 4. DEFAULT_TEMP_PASSWORD
    const tempPassword = process.env.DEFAULT_TEMP_PASSWORD?.trim()
    if (!tempPassword) {
        errors.push("DEFAULT_TEMP_PASSWORD is required for initial temporary credentials.")
    } else if (tempPassword.length < 8) {
        errors.push("DEFAULT_TEMP_PASSWORD must be at least 8 characters long.")
    }

    if (errors.length > 0) {
        throw new Error(
            `\n❌ ENVIRONMENT CONFIGURATION ERROR:\n- ` + errors.join("\n- ") + "\n"
        )
    }

    isAsserted = true
}
