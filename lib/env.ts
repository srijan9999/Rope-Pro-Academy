import "server-only"

let isAsserted = false

interface DiagnosticFacts {
    length: number
    whitespace: boolean
    quotes: boolean
    nonHex?: boolean
    protocol?: string
}

function formatDiagnostics(facts: DiagnosticFacts): string {
    const parts = [
        `length: ${facts.length}`,
        `whitespace: ${facts.whitespace}`,
        `quotes: ${facts.quotes}`,
    ]
    if (facts.nonHex !== undefined) {
        parts.push(`non-hex: ${facts.nonHex}`)
    }
    if (facts.protocol !== undefined) {
        parts.push(`protocol: ${facts.protocol}`)
    }
    return `(${parts.join(", ")})`
}

/**
 * Validates critical environment variables at startup.
 * Skips validation during local 'next build' and CI without secrets (VERCEL !== "1").
 * When building on Vercel (VERCEL === "1"), executes full validation to fail broken builds before deployment.
 *
 * Enforces:
 * - LIVE_DATABASE_URL present and valid postgres URL (matching prisma/schema.prisma)
 * - NEXTAUTH_SECRET >= 32 characters
 * - NEXTAUTH_URL valid and uses https:// in production (allows http:// for localhost/127.0.0.1)
 * - DEFAULT_TEMP_PASSWORD >= 8 characters
 * - ENCRYPTION_KEY 64-char hex in production
 *
 * Never prints variable values or sensitive strings in error messages.
 * Only outputs safe diagnostic facts: length, whitespace boolean, quote boolean, non-hex boolean.
 */
export function assertEnv(): void {
    if (isAsserted) return

    // In build phase, only validate if running on Vercel where production/preview env vars are configured.
    // Local development and CI builds without secrets bypass validation during 'next build'.
    if (process.env.NEXT_PHASE === "phase-production-build" && process.env.VERCEL !== "1") {
        return
    }

    const errors: string[] = []

    // 1. LIVE_DATABASE_URL (matches prisma/schema.prisma)
    const rawDbUrl = process.env.LIVE_DATABASE_URL
    if (!rawDbUrl || !rawDbUrl.trim()) {
        errors.push("LIVE_DATABASE_URL is missing or empty.")
    } else {
        const trimmed = rawDbUrl.trim()
        const hasWhitespace = /\s/.test(rawDbUrl)
        const hasQuotes = /["']/.test(rawDbUrl)
        const isPg = trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")
        if (!isPg || hasWhitespace || hasQuotes) {
            errors.push(
                `LIVE_DATABASE_URL is malformed ${formatDiagnostics({
                    length: rawDbUrl.length,
                    whitespace: hasWhitespace,
                    quotes: hasQuotes,
                })}. Must be a valid PostgreSQL connection string starting with postgres:// or postgresql:// with no whitespace or quotes.`
            )
        }
    }

    // 2. NEXTAUTH_SECRET (>= 32 chars)
    const rawSecret = process.env.NEXTAUTH_SECRET
    if (!rawSecret || !rawSecret.trim()) {
        errors.push("NEXTAUTH_SECRET is missing or empty.")
    } else {
        const hasWhitespace = /\s/.test(rawSecret)
        const hasQuotes = /["']/.test(rawSecret)
        if (rawSecret.length < 32 || hasWhitespace || hasQuotes) {
            errors.push(
                `NEXTAUTH_SECRET is malformed ${formatDiagnostics({
                    length: rawSecret.length,
                    whitespace: hasWhitespace,
                    quotes: hasQuotes,
                })}. Must be at least 32 characters with no whitespace or quotes.`
            )
        }
    }

    // 3. NEXTAUTH_URL (Required only in Production; skipped in Vercel Preview where NextAuth infers VERCEL_URL)
    const isVercel = process.env.VERCEL === "1"
    const vercelEnv = process.env.VERCEL_ENV
    const isVercelPreview =
        vercelEnv === "preview" ||
        (Boolean(process.env.VERCEL_URL) && vercelEnv !== "production")
    const isProduction =
        (isVercel ? vercelEnv === "production" : process.env.NODE_ENV === "production") &&
        !isVercelPreview

    const rawNextAuthUrl = process.env.NEXTAUTH_URL
    if (isProduction && (!rawNextAuthUrl || !rawNextAuthUrl.trim())) {
        errors.push("NEXTAUTH_URL is required in production.")
    } else if (rawNextAuthUrl && rawNextAuthUrl.trim()) {
        const hasWhitespace = /\s/.test(rawNextAuthUrl)
        const hasQuotes = /["']/.test(rawNextAuthUrl)
        let protocol = "unknown"
        let validProtocol = false
        try {
            const parsed = new URL(rawNextAuthUrl.trim())
            protocol = parsed.protocol
            const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
            validProtocol = isLocal || parsed.protocol === "https:"
        } catch {
            protocol = "invalid"
        }

        if (!validProtocol || hasWhitespace || hasQuotes) {
            errors.push(
                `NEXTAUTH_URL is malformed ${formatDiagnostics({
                    length: rawNextAuthUrl.length,
                    whitespace: hasWhitespace,
                    quotes: hasQuotes,
                    protocol,
                })}. Must be a valid HTTPS URL (except localhost/127.0.0.1 in dev) with no whitespace or quotes.`
            )
        }
    }

    // 4. DEFAULT_TEMP_PASSWORD (>= 8 chars)
    const rawTempPassword = process.env.DEFAULT_TEMP_PASSWORD
    if (!rawTempPassword || !rawTempPassword.trim()) {
        errors.push("DEFAULT_TEMP_PASSWORD is missing or empty.")
    } else {
        const hasWhitespace = /\s/.test(rawTempPassword)
        const hasQuotes = /["']/.test(rawTempPassword)
        if (rawTempPassword.length < 8 || hasWhitespace || hasQuotes) {
            errors.push(
                `DEFAULT_TEMP_PASSWORD is malformed ${formatDiagnostics({
                    length: rawTempPassword.length,
                    whitespace: hasWhitespace,
                    quotes: hasQuotes,
                })}. Must be at least 8 characters with no whitespace or quotes.`
            )
        }
    }

    // 5. ENCRYPTION_KEY (Required in production; exactly 64-character hex string)
    const rawKey = process.env.ENCRYPTION_KEY
    if (isProduction && (!rawKey || !rawKey.trim())) {
        errors.push("ENCRYPTION_KEY is required in production.")
    } else if (rawKey && rawKey.trim()) {
        const hasWhitespace = /\s/.test(rawKey)
        const hasQuotes = /["']/.test(rawKey)
        const hasNonHex = /[^0-9a-fA-F]/.test(rawKey.trim())
        const isHex64 = rawKey.length === 64 && /^[0-9a-fA-F]{64}$/.test(rawKey)

        if (!isHex64) {
            errors.push(
                `ENCRYPTION_KEY is malformed ${formatDiagnostics({
                    length: rawKey.length,
                    whitespace: hasWhitespace,
                    quotes: hasQuotes,
                    nonHex: hasNonHex,
                })}. Must be exactly 64 hexadecimal characters with no whitespace or quotes.`
            )
        }
    }

    if (errors.length > 0) {
        throw new Error(
            `\n❌ ENVIRONMENT CONFIGURATION ERROR:\n- ` + errors.join("\n- ") + "\n"
        )
    }

    isAsserted = true
}
