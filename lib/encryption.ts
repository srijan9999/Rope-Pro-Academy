import "server-only"
import crypto from "crypto"

export const ENCRYPTION_PREFIX = "enc:v1:"

// ENCRYPTION_KEY must be a 32-byte (256-bit) hex string (64 characters)
const getEncryptionKey = (): Buffer => {
    const key = process.env.ENCRYPTION_KEY?.trim()
    if (!key || key.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error(
            "ENCRYPTION_KEY environment variable is required and must be a 64-character hex string (32 bytes)."
        )
    }
    return Buffer.from(key, "hex")
}

const IV_LENGTH = 16 // For AES-256-CBC, IV is 16 bytes (32 hex characters)

/**
 * Encrypt a string value using AES-256-CBC with versioned prefix (enc:v1:)
 */
export function encrypt(text: string): string {
    if (!text) return text

    try {
        const iv = crypto.randomBytes(IV_LENGTH)
        const key = getEncryptionKey()
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
        let encrypted = cipher.update(text, "utf8", "hex")
        encrypted += cipher.final("hex")
        return `${ENCRYPTION_PREFIX}${iv.toString("hex")}:${encrypted}`
    } catch (error) {
        console.error("Encryption failed:", error instanceof Error ? error.message : "Unknown error")
        throw new Error("Encryption failed.")
    }
}

/**
 * Decrypt a string:
 * - Versioned prefixed values (enc:v1:...) are decrypted; fails loudly if corrupt or wrong key.
 * - Legacy unprefixed values (<iv>:<ciphertext>) are decrypted for backward compatibility.
 * - Plaintext values pass through safely.
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText

    const isPrefixed = encryptedText.startsWith(ENCRYPTION_PREFIX)
    const rawPayload = isPrefixed
        ? encryptedText.slice(ENCRYPTION_PREFIX.length)
        : encryptedText

    // Check if payload matches IV:ciphertext structure (32 hex chars IV + hex ciphertext)
    const parts = rawPayload.split(":")
    const isFormattedCipher =
        parts.length === 2 &&
        parts[0].length === 32 &&
        /^[0-9a-fA-F]+$/.test(parts[0]) &&
        /^[0-9a-fA-F]+$/.test(parts[1])

    // If neither prefixed nor formatted like a cipher, treat as plaintext legacy value
    if (!isPrefixed && !isFormattedCipher) {
        return encryptedText
    }

    try {
        if (!isFormattedCipher) {
            throw new Error("Malformed ciphertext payload format.")
        }

        const iv = Buffer.from(parts[0], "hex")
        const encrypted = parts[1]
        const key = getEncryptionKey()
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
        let decrypted = decipher.update(encrypted, "hex", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    } catch (error) {
        // Redact secrets completely in logs
        console.error("Decryption error: Failed to decrypt protected field. Possible key mismatch or data corruption.")
        if (isPrefixed) {
            // Fail loudly on real decrypt errors for versioned payloads
            throw new Error("Decryption error: Unable to decrypt protected field.")
        }
        // Legacy fallback return
        return encryptedText
    }
}

/**
 * Check if a string is encrypted (either versioned enc:v1: or legacy IV:ciphertext)
 */
export function isEncrypted(text: string): boolean {
    if (!text) return false
    if (text.startsWith(ENCRYPTION_PREFIX)) return true
    const parts = text.split(":")
    return (
        parts.length === 2 &&
        parts[0].length === 32 &&
        /^[0-9a-fA-F]{32}$/.test(parts[0]) &&
        /^[0-9a-fA-F]+$/.test(parts[1])
    )
}
