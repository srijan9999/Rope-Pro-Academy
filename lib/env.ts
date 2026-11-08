import "server-only"

let isAsserted = false

/**
 * Validates critical environment variables at startup.
 * Skips validation during 'next build' (NEXT_PHASE === "phase-production-build").
 * Enforces:
 * - DATABASE_URL present
 * - NEXTAUTH_SECRET >= 32 characters
 * - NEXTAUTH_URL valid and uses https:// (allows http:// for localhost/127.0.0.1)
 * - DEFAULT_TEMP_PASSWORD >= 8 characters
 *
 * Never prints variable values or lengths in error messages.
 */
export function assertEnv(): void {
    if (isAsserted) return

    if (process.env.NEXT_PHASE === "phase-production-build") {
        return
    }

    const errors: string[] = []

    // 1. DATABASE_URL
    if (!process.env.DATABASE_URL?.trim()) {
        errors.push("DATABASE_URL is missing or empty.")
    }

    // 2. NEXTAUTH_SECRET (>= 32 chars)
    const secret = process.env.NEXTAUTH_SECRET?.trim()
    if (!secret || secret.length < 32) {
        errors.push("NEXTAUTH_SECRET is missing or shorter than 32 characters.")
    }

    // 3. NEXTAUTH_URL (Required only in Production; skipped in Vercel Preview where NextAuth infers VERCEL_URL)
    const isVercelPreview =
        process.env.VERCEL_ENV === "preview" ||
        (Boolean(process.env.VERCEL_URL) && process.env.VERCEL_ENV !== "production")
    const isProduction = process.env.NODE_ENV === "production" && !isVercelPreview

    const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
    if (isProduction && !nextAuthUrl) {
        errors.push("NEXTAUTH_URL is required in production.")
    } else if (nextAuthUrl) {
        try {
            const parsed = new URL(nextAuthUrl)
            const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
            if (!isLocal && parsed.protocol !== "https:") {
                errors.push("NEXTAUTH_URL must use https:// protocol (except for localhost/127.0.0.1).")
            }
        } catch {
            errors.push("NEXTAUTH_URL is not a valid URL.")
        }
    }

    // 4. DEFAULT_TEMP_PASSWORD (>= 8 chars)
    const tempPassword = process.env.DEFAULT_TEMP_PASSWORD?.trim()
    if (!tempPassword || tempPassword.length < 8) {
        errors.push("DEFAULT_TEMP_PASSWORD is missing or shorter than 8 characters.")
    }

    // 5. ENCRYPTION_KEY (Required in production; 64-character hex string)
    const encryptionKey = process.env.ENCRYPTION_KEY?.trim()
    if (process.env.NODE_ENV === "production" && !encryptionKey) {
        errors.push("ENCRYPTION_KEY is required in production.")
    } else if (encryptionKey && (encryptionKey.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(encryptionKey))) {
        errors.push("ENCRYPTION_KEY must be a 64-character hexadecimal string.")
    }

    if (errors.length > 0) {
        throw new Error(
            `\n❌ ENVIRONMENT CONFIGURATION ERROR:\n- ` + errors.join("\n- ") + "\n"
        )
    }

    isAsserted = true
}
