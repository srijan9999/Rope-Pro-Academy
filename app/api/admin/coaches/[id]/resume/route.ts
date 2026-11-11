import { NextResponse } from "next/server"
import { requireRole } from "@/lib/guards"
import { prisma } from "@/lib/prisma"
import { getUTApi, isValidUploadThingKey } from "@/lib/uploadthing-server"

export const dynamic = "force-dynamic"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const guard = await requireRole("ADMIN")
        if (guard.response) return guard.response

        const { id } = await params
        if (!id) {
            return NextResponse.json({ success: false, error: "Coach ID is required" }, { status: 400 })
        }

        const coach = await prisma.coach.findFirst({
            where: {
                OR: [{ id }, { coachId: id }, { userId: id }],
            },
            select: {
                id: true,
                fullName: true,
                resumeUrl: true,
            },
        })

        if (!coach || !coach.resumeUrl) {
            return NextResponse.json({ success: false, error: "Coach or resume not found" }, { status: 404 })
        }

        const resumeRef = coach.resumeUrl.trim()

        // If it's an UploadThing key (not a full URL)
        if (isValidUploadThingKey(resumeRef)) {
            const token = process.env.UPLOADTHING_TOKEN?.trim()
            if (token) {
                try {
                    const utapi = getUTApi()
                    // Try generating signed URL (expires in 5 minutes)
                    const signed = await utapi.getSignedURL(resumeRef, { expiresIn: 300 })
                    if (signed?.url) {
                        return NextResponse.json({ success: true, url: signed.url })
                    }
                } catch {
                    // Fall back to direct file URL if private signed URLs are not supported on plan
                }
            }
            return NextResponse.json({ success: true, url: `https://utfs.io/f/${resumeRef}` })
        }

        // If it's an UploadThing URL containing /f/<key>, extract key and generate signed URL if token present
        const utMatch = resumeRef.match(/https:\/\/(?:[a-zA-Z0-9_-]+\.ufs\.sh|utfs\.io)\/f\/([a-zA-Z0-9._-]+)/)
        if (utMatch && utMatch[1] && process.env.UPLOADTHING_TOKEN?.trim()) {
            try {
                const utapi = getUTApi()
                const signed = await utapi.getSignedURL(utMatch[1], { expiresIn: 300 })
                if (signed?.url) {
                    return NextResponse.json({ success: true, url: signed.url })
                }
            } catch {
                // Fall back to stored URL
            }
        }

        // Legacy URL fallback
        return NextResponse.json({ success: true, url: resumeRef })
    } catch (error) {
        console.error("Error retrieving coach resume URL:", error)
        return NextResponse.json({ success: false, error: "Failed to retrieve resume URL" }, { status: 500 })
    }
}
