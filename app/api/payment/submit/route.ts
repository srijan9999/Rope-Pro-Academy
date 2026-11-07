import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

const submitSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    utrNumber: z
        .string()
        .trim()
        .regex(/^\d{12}$/, "Enter the 12-digit UTR (digits only)"),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null)
        if (!body) {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
        }

        const validation = submitSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { userId, utrNumber } = validation.data

        // Atomic guarded update: only allows submission if status is PENDING_PAYMENT or PAYMENT_REJECTED
        const res = await prisma.student.updateMany({
            where: {
                id: userId,
                status: { in: ["PENDING_PAYMENT", "PAYMENT_REJECTED"] },
            },
            data: {
                utrNumber,
                status: "PENDING_VERIFICATION",
                registrationStatus: "SCREENSHOT_UPLOADED",
                paymentSubmittedAt: new Date(),
                paymentRejectionNote: null,
            },
        })

        if (res.count === 0) {
            return NextResponse.json(
                { message: "This registration can no longer accept a payment submission." },
                { status: 409 }
            )
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return NextResponse.json(
                { message: "This UTR has already been submitted. Check the number or contact the academy." },
                { status: 409 }
            )
        }

        console.error("Payment submit error:", e)
        return NextResponse.json(
            { message: "Could not submit payment details. Please try again." },
            { status: 500 }
        )
    }
}
