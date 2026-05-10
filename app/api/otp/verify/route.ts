import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { identifier, token, type } = body

        if (!identifier || !token || !type) {
            return NextResponse.json(
                { error: "Identifier, token, and type are required" },
                { status: 400 }
            )
        }

        console.log(`[OTP API] Verifying ${type} for ${identifier} with token ${token}`)

        // 1. Find the OTP record
        // We look for the most recent one matching criteria
        const otpRecord = await prisma.otp.findFirst({
            where: {
                identifier,
                token,
                type
            }
        })

        if (!otpRecord) {
            return NextResponse.json(
                { error: "Invalid OTP code" },
                { status: 400 }
            )
        }

        // 2. Check Expiry
        if (new Date() > otpRecord.expires) {
            // Cleanup expired token
            await prisma.otp.delete({ where: { id: otpRecord.id } })

            return NextResponse.json(
                { error: "OTP expired" },
                { status: 400 }
            )
        }

        // 3. Valid! Actions based on type

        // Action A: EMAIL_VERIFY -> Update User
        if (type === "EMAIL_VERIFY") {
            const user = await prisma.user.findUnique({
                where: { email: identifier }
            })

            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailVerified: new Date(),
                        status: "ACTIVE" // Activate user upon email verification
                    }
                })
                console.log(`[OTP API] ✅ User Verified: ${identifier}`)
            }
        }

        // Action B: PHONE_VERIFY (Update Student/Coach/Admin phone status if needed)
        // For now, we rely on the client to trust the "success: true" response
        // In future, we might update a 'phoneVerified' field

        // 4. Delete Used Token (Single Use)
        await prisma.otp.delete({
            where: { id: otpRecord.id }
        })

        return NextResponse.json({
            success: true,
            message: "OTP verified successfully"
        })

    } catch (error) {
        console.error("[OTP API] Error verifying OTP:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
