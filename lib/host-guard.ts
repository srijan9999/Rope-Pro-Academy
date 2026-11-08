import fs from "fs"
import path from "path"

/**
 * Normalizes a Neon database host, connection string, or identifier
 * to its base endpoint ID (e.g., "ep-blue-mouse-a1j50ok3").
 */
export function extractEndpointId(str: string): string {
    if (!str) return ""
    const match = str.match(/ep-[a-z0-9-]+/)
    if (!match) return ""
    return match[0].replace(/-pooler$/, "")
}

/**
 * Scans all non-test .env* files in the workspace plus PRODUCTION_DB_HOST
 * and returns the set of protected endpoint IDs.
 */
export function getProtectedEndpointIds(rootDir: string = process.cwd()): Set<string> {
    const protectedIds = new Set<string>()

    if (process.env.PRODUCTION_DB_HOST) {
        const id = extractEndpointId(process.env.PRODUCTION_DB_HOST)
        if (id) protectedIds.add(id)
    }

    try {
        const files = fs.readdirSync(rootDir)
        for (const file of files) {
            // Include .env, .env.local, .env.production, etc.; skip .env.test*
            if (file.startsWith(".env") && !file.includes(".test")) {
                const fullPath = path.join(rootDir, file)
                if (fs.statSync(fullPath).isFile()) {
                    const content = fs.readFileSync(fullPath, "utf-8")
                    const matches = content.match(/ep-[a-z0-9-]+/g) || []
                    for (const m of matches) {
                        const id = m.replace(/-pooler$/, "")
                        if (id) protectedIds.add(id)
                    }
                }
            }
        }
    } catch {
        // Fall back gracefully
    }

    return protectedIds
}

/**
 * Verifies that the target database URL does not match any protected database endpoint.
 * Prints only the normalized endpoint ID (never credentials).
 */
export function assertSafeDatabaseUrl(targetUrl: string, rootDir: string = process.cwd()): string {
    const targetEndpoint = extractEndpointId(targetUrl)
    if (!targetEndpoint) {
        console.error("❌ ERROR: Could not extract endpoint ID from target DATABASE_URL.")
        process.exit(1)
    }

    const protectedIds = getProtectedEndpointIds(rootDir)
    if (protectedIds.has(targetEndpoint)) {
        console.error(
            `\n⛔ HOST GUARD ABORT: Target database endpoint '${targetEndpoint}' matches a protected production/development database!`
        )
        console.error(`Protected endpoints discovered: ${Array.from(protectedIds).join(", ")}`)
        process.exit(1)
    }

    console.log(`🛡️ Host Guard verified: Target endpoint '${targetEndpoint}' is safe and separate from protected endpoints.`)
    return targetEndpoint
}
