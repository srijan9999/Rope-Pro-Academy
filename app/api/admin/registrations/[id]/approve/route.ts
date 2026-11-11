import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureStudentIdCardNumber } from "@/lib/id-number"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function PATCH(
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
            return NextResponse.json({ message: "Registration ID is required" }, { status: 400 })
        }

        const adminId = session.user.id || "ADMIN"

        // Execute student approval atomically with ID card number generation
        const result = await prisma.$transaction(async (tx) => {
            const student = await tx.student.findUnique({
                where: { id },
                select: { id: true, userId: true, status: true, idCardNumber: true },
            })

            if (!student) {
                return { error: "NOT_FOUND", message: "Registration does not exist." }
            }

            if (student.status !== "PENDING_VERIFICATION") {
                return {
                    error: "INVALID_STATUS",
                    message: `Registration is '${student.status}', not awaiting verification.`,
                }
            }

            // Issue atomic ID card number (RPA-PL26...)
            const idCardNumber = await ensureStudentIdCardNumber(tx, id)

            await tx.student.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    registrationStatus: "VERIFIED",
                    paymentReviewedAt: new Date(),
                    paymentReviewedBy: adminId,
                    idCardNumber,
                },
            })

            if (student.userId) {
                await tx.user.update({
                    where: { id: student.userId },
                    data: { status: "ACTIVE" },
                })
            }

            return { success: true, idCardNumber }
        })

        if ("error" in result) {
            const statusCode = result.error === "NOT_FOUND" ? 404 : 409
            return NextResponse.json({ message: result.message }, { status: statusCode })
        }

        revalidatePath("/dashboard/admin/registrations")
        revalidatePath("/dashboard/admin/pending-payments")
        revalidatePath("/dashboard/admin/users")

        return NextResponse.json(
            {
                success: true,
                message: "Registration approved successfully",
                idCardNumber: result.idCardNumber,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Approve registration error:", error)
        return NextResponse.json(
            { message: "Could not approve registration. Please try again." },
            { status: 500 }
        )
    }
}
