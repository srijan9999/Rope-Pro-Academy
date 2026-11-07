import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

        // Only transition from PENDING_VERIFICATION to ACTIVE
        const res = await prisma.student.updateMany({
            where: {
                id,
                status: "PENDING_VERIFICATION",
            },
            data: {
                status: "ACTIVE",
                registrationStatus: "VERIFIED",
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

        // Activate the associated user account as well
        const student = await prisma.student.findUnique({
            where: { id },
            select: { userId: true },
        })

        if (student?.userId) {
            await prisma.user.update({
                where: { id: student.userId },
                data: { status: "ACTIVE" },
            })
        }

        revalidatePath("/dashboard/admin/registrations")
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error("Approve registration error:", error)
        return NextResponse.json(
            { message: "Could not approve registration. Please try again." },
            { status: 500 }
        )
    }
}
