import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
        }
        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const { id } = await params
        if (!id) {
            return NextResponse.json({ message: "Coach ID is required" }, { status: 400 })
        }

        const body = await req.json().catch(() => ({}))
        const rejectionNote = (body.note || body.reason || "Application rejected by administration").trim()
        const adminId = session.user.id || "ADMIN"

        const result = await prisma.$transaction(async (tx) => {
            const coach = await tx.coach.findFirst({
                where: {
                    OR: [{ id }, { coachId: id }, { userId: id }],
                },
                include: {
                    user: {
                        select: { id: true, email: true, status: true },
                    },
                },
            })

            if (!coach) {
                return { error: "NOT_FOUND", message: "Coach profile not found" }
            }

            // Update coach profile
            await tx.coach.update({
                where: { id: coach.id },
                data: {
                    isApproved: false,
                    applicationStatus: "REJECTED",
                    coachStatus: "INACTIVE",
                    isActive: false,
                    reviewedAt: new Date(),
                    reviewedBy: adminId,
                    rejectedAt: new Date(),
                    rejectionReason: rejectionNote,
                    rejectionNote: rejectionNote,
                },
            })

            // Update user status
            await tx.user.update({
                where: { id: coach.user.id },
                data: { status: "INACTIVE" },
            })

            // Audit log
            await tx.auditLog.create({
                data: {
                    userId: adminId,
                    action: "REJECT",
                    entityType: "COACH",
                    entityId: coach.id,
                    newValue: JSON.stringify({
                        coachId: coach.coachId,
                        rejectedBy: adminId,
                        reason: rejectionNote,
                    }),
                },
            })

            return { success: true }
        })

        if ("error" in result) {
            return NextResponse.json({ message: result.message }, { status: 404 })
        }

        revalidatePath("/dashboard/admin/coaches")
        revalidatePath("/dashboard/admin/users")

        return NextResponse.json(
            { success: true, message: "Coach application rejected" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Coach rejection error:", error)
        return NextResponse.json(
            { message: "Could not reject coach application. Please try again." },
            { status: 500 }
        )
    }
}
