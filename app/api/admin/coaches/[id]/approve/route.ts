import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureCoachIdCardNumber } from "@/lib/id-number"
import { hashDefaultPassword } from "@/lib/default-password"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function POST(
    _req: Request,
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

        const adminId = session.user.id || "ADMIN"

        // Execute coach approval atomically with status guard
        const result = await prisma.$transaction(async (tx) => {
            // Find coach by ID or coachId
            const coach = await tx.coach.findFirst({
                where: {
                    OR: [{ id }, { coachId: id }, { userId: id }],
                },
                include: {
                    user: {
                        select: { id: true, email: true, status: true, password: true },
                    },
                },
            })

            if (!coach) {
                return { error: "NOT_FOUND", message: "Coach profile not found" }
            }

            // Status guard: ensure coach is not already approved
            if (coach.isApproved && coach.applicationStatus === "APPROVED" && coach.user.status === "ACTIVE") {
                return {
                    error: "ALREADY_APPROVED",
                    message: "This coach application is already approved and active.",
                }
            }

            // Issue atomic ID card number (RPA-CH26...)
            const idCardNumber = await ensureCoachIdCardNumber(tx, coach.id)

            // Password handling:
            // If the coach chose a password at registration, DO NOT touch it!
            // Only set a default temp password if the user record has no password set.
            const userUpdateData: Record<string, unknown> = {
                status: "ACTIVE",
            }

            if (!coach.user.password || coach.user.password.trim() === "") {
                userUpdateData.password = await hashDefaultPassword()
                userUpdateData.mustChangePassword = true
            }

            // Update user account
            await tx.user.update({
                where: { id: coach.user.id },
                data: userUpdateData,
            })

            // Update coach profile
            const updatedCoach = await tx.coach.update({
                where: { id: coach.id },
                data: {
                    isApproved: true,
                    applicationStatus: "APPROVED",
                    coachStatus: "ACTIVE",
                    isActive: true,
                    reviewedAt: new Date(),
                    reviewedBy: adminId,
                    approvedAt: new Date(),
                    approvedBy: adminId,
                    idCardNumber,
                },
            })

            // Audit log
            await tx.auditLog.create({
                data: {
                    userId: adminId,
                    action: "APPROVE",
                    entityType: "COACH",
                    entityId: coach.id,
                    newValue: JSON.stringify({
                        coachId: coach.coachId,
                        idCardNumber,
                        approvedBy: adminId,
                    }),
                },
            })

            // Notify coach
            await tx.notification.create({
                data: {
                    userId: coach.user.id,
                    title: "Application Approved!",
                    message: `Congratulations! Your coach application has been approved. Your official ID card is now available (${idCardNumber}).`,
                    type: "SUCCESS",
                    category: "SYSTEM",
                    actionUrl: "/dashboard/coach/id-card",
                },
            })

            return { success: true, idCardNumber, coachId: updatedCoach.coachId }
        })

        if ("error" in result) {
            const statusCode = result.error === "NOT_FOUND" ? 404 : 409
            return NextResponse.json({ message: result.message }, { status: statusCode })
        }

        revalidatePath("/dashboard/admin/coaches")
        revalidatePath("/dashboard/admin/users")

        return NextResponse.json(
            {
                success: true,
                message: "Coach approved successfully",
                data: {
                    idCardNumber: result.idCardNumber,
                    coachId: result.coachId,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Coach approval error:", error)
        return NextResponse.json(
            { message: "Could not approve coach application. Please try again." },
            { status: 500 }
        )
    }
}
