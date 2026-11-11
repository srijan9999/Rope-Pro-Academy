import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyImageFileKey, deleteUploadedFile } from "@/lib/uploadthing-server"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { photoKey, targetUserId } = body

        if (!photoKey || typeof photoKey !== "string") {
            return NextResponse.json(
                { success: false, message: "photoKey is required" },
                { status: 400 }
            )
        }

        // Verify the photo key against UploadThing
        const verification = await verifyImageFileKey(photoKey)
        if (!verification.valid || !verification.fileUrl) {
            return NextResponse.json(
                { success: false, message: verification.error || "Invalid image upload" },
                { status: 400 }
            )
        }

        const isAdmin = session.user.role === "ADMIN"
        const userId = isAdmin && targetUserId ? targetUserId : session.user.id

        // Determine if target user is Student or Coach
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        })

        if (!targetUser) {
            await deleteUploadedFile(photoKey).catch(() => {})
            return NextResponse.json(
                { success: false, message: "Target user not found" },
                { status: 404 }
            )
        }

        if (targetUser.role === "STUDENT") {
            const student = await prisma.student.findUnique({
                where: { userId },
                select: { id: true, photoKey: true },
            })
            if (!student) {
                return NextResponse.json(
                    { success: false, message: "Student record not found" },
                    { status: 404 }
                )
            }

            // Cleanup old photo if replacing
            if (student.photoKey && student.photoKey !== photoKey) {
                deleteUploadedFile(student.photoKey).catch(() => {})
            }

            await prisma.student.update({
                where: { id: student.id },
                data: {
                    photoKey,
                    photoUrl: verification.fileUrl,
                    lastCardUpdate: new Date(),
                },
            })
        } else if (targetUser.role === "COACH") {
            const coach = await prisma.coach.findUnique({
                where: { userId },
                select: { id: true, photoKey: true },
            })
            if (!coach) {
                return NextResponse.json(
                    { success: false, message: "Coach record not found" },
                    { status: 404 }
                )
            }

            // Cleanup old photo if replacing
            if (coach.photoKey && coach.photoKey !== photoKey) {
                deleteUploadedFile(coach.photoKey).catch(() => {})
            }

            await prisma.coach.update({
                where: { id: coach.id },
                data: {
                    photoKey,
                    photoUrl: verification.fileUrl,
                },
            })
        } else {
            return NextResponse.json(
                { success: false, message: "User is neither student nor coach" },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            photoUrl: verification.fileUrl,
            photoKey,
            message: "Profile photo updated successfully",
        })
    } catch (error) {
        console.error("Error updating profile photo:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update profile photo" },
            { status: 500 }
        )
    }
}
