import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

export const dynamic = "force-dynamic"

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"]
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

function validateMagicBytes(buffer: Buffer, ext: string): boolean {
    if (buffer.length < 8) return false

    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    if (ext === ".pdf") {
        return (
            buffer[0] === 0x25 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x44 &&
            buffer[3] === 0x46 &&
            buffer[4] === 0x2d
        )
    }

    // DOC magic bytes (OLE Compound File): 0xD0 0xCF 0x11 0xE0 0xA1 0xB1 0x1A 0xE1
    if (ext === ".doc") {
        return (
            buffer[0] === 0xd0 &&
            buffer[1] === 0xcf &&
            buffer[2] === 0x11 &&
            buffer[3] === 0xe0 &&
            buffer[4] === 0xa1 &&
            buffer[5] === 0xb1 &&
            buffer[6] === 0x1a &&
            buffer[7] === 0xe1
        )
    }

    // DOCX magic bytes (ZIP archive PK..): 0x50 0x4B 0x03 0x04
    if (ext === ".docx") {
        return (
            buffer[0] === 0x50 &&
            buffer[1] === 0x4b &&
            buffer[2] === 0x03 &&
            buffer[3] === 0x04
        )
    }

    return false
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            )
        }

        // 1. Validate file size (5 MB cap)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File size exceeds the 5 MB limit" },
                { status: 400 }
            )
        }

        // 2. Validate file extension (PDF, DOC, DOCX only)
        const clientName = file.name || "resume.pdf"
        const ext = path.extname(clientName).toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file type. Allowed extensions are: PDF, DOC, DOCX",
                },
                { status: 400 }
            )
        }

        // 3. Validate MIME type
        const mimeType = file.type
        if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType) && mimeType !== "application/octet-stream") {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid file MIME type: ${mimeType}.`,
                },
                { status: 400 }
            )
        }

        // 4. Read buffer and validate magic bytes
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        if (!validateMagicBytes(buffer, ext)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File content does not match the expected document format.",
                },
                { status: 400 }
            )
        }

        // 4. Save file under a random UUID (ignore client filename entirely)
        const uploadDir = path.resolve(process.cwd(), "public", "uploads", "resumes")
        await mkdir(uploadDir, { recursive: true })

        const randomFileName = `${crypto.randomUUID()}${ext}`
        const filePath = path.resolve(uploadDir, randomFileName)

        // Block path traversal defensively
        if (!filePath.startsWith(uploadDir)) {
            return NextResponse.json(
                { success: false, error: "Invalid file path" },
                { status: 400 }
            )
        }

        await writeFile(filePath, buffer)

        const fileUrl = `/uploads/resumes/${randomFileName}`

        return NextResponse.json({
            success: true,
            url: fileUrl,
            name: randomFileName,
            size: file.size,
        })
    } catch (error: unknown) {
        console.error("Resume upload error:", error)
        const message = error instanceof Error ? error.message : "Failed to upload resume"
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
