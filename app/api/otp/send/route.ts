import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOtp, sendOtp, OtpType } from "@/lib/otp"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { identifier, type } = body

        if (!identifier || !type) {
            return NextResponse.json(
                { error: "Identifier and type are required" },
                { status: 400 }
            )
        }

        // Validate type
        const validTypes = ["EMAIL_VERIFY", "PHONE_VERIFY", "PASSWORD_RESET", "LOGIN"]
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Invalid OTP type" },
                { status: 400 }
            )
        }

        console.log(`[OTP API] Request to send ${type} OTP to ${identifier}`)

        // CHECK 1: If user exists (for password reset)
        if (type === "PASSWORD_RESET") {
            const user = await prisma.user.findUnique({
                where: { email: identifier }
            })
            if (!user) {
                // Return success even if user not found to prevent enumeration attacks
                // But logging it for debug
                console.log(`[OTP API] ⚠️ Password reset requested for non-existent email: ${identifier}`)
                return NextResponse.json({ success: true, message: "If account exists, OTP sent" })
            }
        }

        // 2. Delete existing OTPs for this identifier (Throttle/Spam prevention)
        await prisma.otp.deleteMany({
            where: { identifier }
        })

        // 3. Generate new OTP
        const token = generateOtp(6)
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // 4. Save to Database
        await prisma.otp.create({
            data: {
                identifier,
                token,
                type,
                expires
            }
        })

        // 5. Send OTP
        const sent = await sendOtp(identifier, token, type as OtpType)

        if (!sent) {
            return NextResponse.json(
                { error: "Failed to dispatch OTP" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully"
        })

    } catch (error) {
        console.error("[OTP API] Error sending OTP:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
