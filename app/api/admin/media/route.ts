import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

export const dynamic = "force-dynamic"

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// GET: Fetch all media for admin management
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const media = await prisma.media.findMany({
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json({ success: true, media })
    } catch (err) {
        console.error("Error fetching media:", err)
        return NextResponse.json({ success: false, error: "Could not fetch media" }, { status: 500 })
    }
}

// POST: Add new media (via direct file upload or UploadThing/external URL)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const contentType = request.headers.get("content-type") || ""

        let url = ""
        let year: string | null = null
        let title: string | null = null
        let caption: string | null = null
        let category = "GALLERY"

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData()
            const file = formData.get("file") as File | null
            const directUrl = formData.get("url") as string | null
            year = (formData.get("year") as string | null) || null
            title = (formData.get("title") as string | null) || null
            caption = (formData.get("caption") as string | null) || null
            category = (formData.get("category") as string | null) || "GALLERY"

            if (file && file.size > 0) {
                if (file.size > MAX_FILE_SIZE) {
                    return NextResponse.json(
                        { success: false, error: "File exceeds 10 MB limit" },
                        { status: 400 }
                    )
                }

                const originalName = file.name || "image.jpg"
                const ext = path.extname(originalName).toLowerCase()
                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                    return NextResponse.json(
                        { success: false, error: "Allowed formats: JPG, PNG, WEBP, GIF" },
                        { status: 400 }
                    )
                }

                const uploadDir = path.join(process.cwd(), "public", "uploads", "media")
                await mkdir(uploadDir, { recursive: true })

                const randomHash = crypto.randomBytes(8).toString("hex")
                const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_")
                const filename = `${Date.now()}-${randomHash}-${safeBase}${ext}`
                const filePath = path.join(uploadDir, filename)

                const bytes = await file.arrayBuffer()
                await writeFile(filePath, Buffer.from(bytes))

                url = `/uploads/media/${filename}`
            } else if (directUrl && directUrl.trim()) {
                url = directUrl.trim()
            } else {
                return NextResponse.json(
                    { success: false, error: "Please upload an image file or provide an image URL" },
                    { status: 400 }
                )
            }
        } else {
            const body = await request.json().catch(() => null)
            if (!body?.url) {
                return NextResponse.json(
                    { success: false, error: "Image URL is required" },
                    { status: 400 }
                )
            }
            url = body.url.trim()
            year = body.year ? String(body.year).trim() : null
            title = body.title ? String(body.title).trim() : null
            caption = body.caption ? String(body.caption).trim() : null
            category = body.category || "GALLERY"
        }

        const created = await prisma.media.create({
            data: {
                url,
                year: year || null,
                title: title || null,
                caption: caption || null,
                category,
            },
        })

        return NextResponse.json({ success: true, media: created }, { status: 201 })
    } catch (err) {
        console.error("Error creating media:", err)
        return NextResponse.json({ success: false, error: "Could not create media" }, { status: 500 })
    }
}

// DELETE: Delete a media item by ID
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing media ID" }, { status: 400 })
        }

        await prisma.media.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Error deleting media:", err)
        return NextResponse.json({ success: false, error: "Could not delete media" }, { status: 500 })
    }
}
