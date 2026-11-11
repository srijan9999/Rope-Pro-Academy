import "server-only"
import { UTApi } from "uploadthing/server"

/**
 * Lazily instantiate UTApi so importing this file in environments
 * without UPLOADTHING_TOKEN (e.g. during build / tests) does not throw.
 */
let utapiInstance: UTApi | null = null

export function getUTApi(): UTApi {
    if (!utapiInstance) {
        const token = process.env.UPLOADTHING_TOKEN?.trim()
        utapiInstance = new UTApi(token ? { token } : undefined)
    }
    return utapiInstance
}

/**
 * Validate file key format strictly to prevent injection or arbitrary path attacks.
 * UploadThing file keys are typically alphanumeric with hyphens / underscores (e.g. "abc123-def456.pdf").
 */
export function isValidUploadThingKey(key: string): boolean {
    if (!key || typeof key !== "string") return false
    // Reject any whitespace, path traversal, colons, or URL schemes
    if (key.includes("://") || key.includes("..") || key.includes("/") || key.includes("\\")) {
        return false
    }
    // UploadThing keys are safe alphanumeric identifiers with dots, dashes, underscores
    return /^[a-zA-Z0-9._-]{8,128}$/.test(key)
}

/**
 * Validate document magic bytes from a buffer
 */
export function validateDocumentMagicBytes(buffer: Buffer): { valid: boolean; type?: "PDF" | "DOC" | "DOCX" } {
    if (buffer.length < 4) return { valid: false }

    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return { valid: true, type: "PDF" }
    }

    // DOCX (ZIP archive PK..): 0x50 0x4B 0x03 0x04
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
        return { valid: true, type: "DOCX" }
    }

    // DOC magic bytes (OLE Compound File): 0xD0 0xCF 0x11 0xE0
    if (buffer.length >= 8) {
        if (
            buffer[0] === 0xd0 &&
            buffer[1] === 0xcf &&
            buffer[2] === 0x11 &&
            buffer[3] === 0xe0 &&
            buffer[4] === 0xa1 &&
            buffer[5] === 0xb1 &&
            buffer[6] === 0x1a &&
            buffer[7] === 0xe1
        ) {
            return { valid: true, type: "DOC" }
        }
    }

    return { valid: false }
}

/**
 * Verify an uploaded resume file key against UploadThing API
 */
export async function verifyResumeFileKey(fileKey: string): Promise<{
    valid: boolean
    fileUrl?: string
    error?: string
}> {
    if (!isValidUploadThingKey(fileKey)) {
        return { valid: false, error: "Invalid resume file key format" }
    }

    const token = process.env.UPLOADTHING_TOKEN?.trim()
    if (!token) {
        // In local development or environments without token configured, accept well-formed key
        return { valid: true, fileUrl: `https://utfs.io/f/${fileKey}` }
    }

    try {
        const utapi = getUTApi()
        // Query UploadThing for file URL / existence
        const urlsResult = await utapi.getFileUrls([fileKey])
        const fileData = urlsResult?.data?.[0]

        if (!fileData || !fileData.url) {
            return { valid: false, error: "Resume file not found in storage. Please re-upload." }
        }

        const fileUrl = fileData.url

        // Attempt magic-byte verification via range request
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 4000)
            const headRes = await fetch(fileUrl, {
                headers: { Range: "bytes=0-15" },
                signal: controller.signal,
            })
            clearTimeout(timeoutId)

            if (headRes.ok || headRes.status === 206) {
                const arrayBuffer = await headRes.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const magicCheck = validateDocumentMagicBytes(buffer)
                if (!magicCheck.valid) {
                    // Cleanup invalid file
                    await utapi.deleteFiles([fileKey]).catch(() => { })
                    return { valid: false, error: "Uploaded file does not match a valid PDF, DOC, or DOCX document format." }
                }
            }
        } catch {
            // If Range request is not supported or timed out, we allow verification based on UploadThing's MIME enforcement
        }

        return { valid: true, fileUrl }
    } catch (err) {
        console.error("Resume file key verification error:", err)
        return { valid: false, error: "Failed to verify resume upload with storage provider" }
    }
}

/**
 * Validate image magic bytes from a buffer
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; type?: "JPEG" | "PNG" | "WEBP" } {
    if (buffer.length < 4) return { valid: false }

    // JPEG: 0xFF 0xD8 0xFF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { valid: true, type: "JPEG" }
    }

    // PNG: 0x89 0x50 0x4E 0x47 (89 50 4E 47 0D 0A 1A 0A)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return { valid: true, type: "PNG" }
    }

    // WebP: 'RIFF'....'WEBP'
    if (buffer.length >= 12) {
        const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
        const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        if (isRiff && isWebp) {
            return { valid: true, type: "WEBP" }
        }
    }

    return { valid: false }
}

/**
 * Verify an uploaded profile image file key against UploadThing API
 */
export async function verifyImageFileKey(fileKey: string): Promise<{
    valid: boolean
    fileUrl?: string
    error?: string
}> {
    if (!isValidUploadThingKey(fileKey)) {
        return { valid: false, error: "Invalid image file key format" }
    }

    const token = process.env.UPLOADTHING_TOKEN?.trim()
    if (!token) {
        return { valid: true, fileUrl: `https://utfs.io/f/${fileKey}` }
    }

    try {
        const utapi = getUTApi()
        const urlsResult = await utapi.getFileUrls([fileKey])
        const fileData = urlsResult?.data?.[0]

        if (!fileData || !fileData.url) {
            return { valid: false, error: "Image file not found in storage. Please re-upload." }
        }

        const fileUrl = fileData.url

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 4000)
            const headRes = await fetch(fileUrl, {
                headers: { Range: "bytes=0-15" },
                signal: controller.signal,
            })
            clearTimeout(timeoutId)

            if (headRes.ok || headRes.status === 206) {
                const arrayBuffer = await headRes.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const magicCheck = validateImageMagicBytes(buffer)
                if (!magicCheck.valid) {
                    await utapi.deleteFiles([fileKey]).catch(() => { })
                    return { valid: false, error: "Uploaded file does not match a valid JPEG, PNG, or WebP image." }
                }
            }
        } catch {
            // Allow if range request times out or is unsupported
        }

        return { valid: true, fileUrl }
    } catch (err) {
        console.error("Image file key verification error:", err)
        return { valid: false, error: "Failed to verify image upload with storage provider" }
    }
}

/**
 * Delete a file from UploadThing by its key
 */
export async function deleteUploadedFile(fileKey: string): Promise<boolean> {
    if (!isValidUploadThingKey(fileKey)) return false
    try {
        const utapi = getUTApi()
        await utapi.deleteFiles([fileKey])
        return true
    } catch {
        return false
    }
}
