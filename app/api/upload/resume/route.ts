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

        // 1. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File size exceeds the 5 MB limit" },
                { status: 400 }
            )
        }

        // 2. Validate file extension
        const originalName = file.name || "resume.pdf"
        const ext = path.extname(originalName).toLowerCase()
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
        const isAllowedMime =
            ALLOWED_MIME_TYPES.includes(mimeType) ||
            (mimeType === "application/octet-stream" && ALLOWED_EXTENSIONS.includes(ext))

        if (!isAllowedMime) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid file MIME type: ${mimeType}. Please upload a valid PDF or Word document.`,
                },
                { status: 400 }
            )
        }

        // 4. Save file to public/uploads/resumes
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes")
        await mkdir(uploadDir, { recursive: true })

        const sanitizedBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_")
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`
        const finalFileName = `${sanitizedBase}-${uniqueSuffix}${ext}`
        const filePath = path.join(uploadDir, finalFileName)

        await writeFile(filePath, buffer)

        const fileUrl = `/uploads/resumes/${finalFileName}`

        return NextResponse.json({
            success: true,
            url: fileUrl,
            name: originalName,
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
