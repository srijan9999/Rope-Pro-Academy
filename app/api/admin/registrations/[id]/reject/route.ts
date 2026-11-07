import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

const rejectSchema = z.object({
    reason: z
        .string()
        .min(2, "Please enter a valid rejection reason so the student knows why."),
})

export async function PATCH(
    request: Request,
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

        const body = await request.json().catch(() => null)
        const validation = rejectSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { reason } = validation.data

        // Only transition from PENDING_VERIFICATION to PAYMENT_REJECTED
        const res = await prisma.student.updateMany({
            where: {
                id,
                status: "PENDING_VERIFICATION",
            },
            data: {
                status: "PAYMENT_REJECTED",
                registrationStatus: "REJECTED",
                paymentRejectionNote: reason.trim(),
                paymentReviewedAt: new Date(),
                paymentReviewedBy: session.user.id || "ADMIN",
            },
        })

        if (res.count === 0) {
            return NextResponse.json(
                { message: "Registration is not awaiting verification or does not exist." },
                { status: 409 }
            )
        }

        revalidatePath("/dashboard/admin/registrations")
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error("Reject registration error:", error)
        return NextResponse.json(
            { message: "Could not reject registration. Please try again." },
            { status: 500 }
        )
    }
}
