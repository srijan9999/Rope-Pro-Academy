import crypto from "crypto"

// Use a secure key from environment variables
// ENCRYPTION_KEY should be a 32-byte (256-bit) hex string (64 characters)
const getEncryptionKey = (): Buffer => {
    const key = process.env.ENCRYPTION_KEY
    if (key && key.length >= 64) {
        return Buffer.from(key.slice(0, 64), "hex")
    }
    // Fallback for development - generate a consistent key
    // In production, always set ENCRYPTION_KEY in .env
    return Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "hex")
}

const IV_LENGTH = 16 // For AES, this is always 16

/**
 * Encrypt a string value using AES-256-CBC
 */
export function encrypt(text: string): string {
    if (!text) return text

    try {
        const iv = crypto.randomBytes(IV_LENGTH)
        const key = getEncryptionKey()
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
        let encrypted = cipher.update(text, "utf8", "hex")
        encrypted += cipher.final("hex")
        return iv.toString("hex") + ":" + encrypted
    } catch (error) {
        console.error("Encryption error:", error)
        return text // Return original if encryption fails
    }
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(":")) return encryptedText

    try {
        const parts = encryptedText.split(":")
        if (parts.length !== 2) return encryptedText

        const iv = Buffer.from(parts[0], "hex")
        const encrypted = parts[1]
        const key = getEncryptionKey()
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
        let decrypted = decipher.update(encrypted, "hex", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    } catch (error) {
        console.error("Decryption error:", error)
        return encryptedText // Return original if decryption fails
    }
}

/**
 * Check if a string is encrypted (contains the IV:ciphertext format)
 */
export function isEncrypted(text: string): boolean {
    if (!text) return false
    const parts = text.split(":")
    return parts.length === 2 && parts[0].length === 32 // IV is 16 bytes = 32 hex chars
}
