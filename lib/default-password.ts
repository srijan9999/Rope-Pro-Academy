import "server-only"
import bcrypt from "bcrypt"

/**
 * Hashes the default temporary password for admin-created accounts.
 * Reads DEFAULT_TEMP_PASSWORD from environment variables.
 * Never exposes the raw password.
 */
export async function hashDefaultPassword(): Promise<string> {
    const pwd = process.env.DEFAULT_TEMP_PASSWORD
    if (!pwd) {
        throw new Error("DEFAULT_TEMP_PASSWORD environment variable is not set")
    }
    return bcrypt.hash(pwd, 12)
}
