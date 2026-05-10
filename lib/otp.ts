import "server-only"
import { prisma } from "@/lib/prisma"
import { sendOTPEmail } from "@/lib/email"

// Types of OTPs
export type OtpType = "EMAIL_VERIFY" | "PHONE_VERIFY" | "PASSWORD_RESET" | "LOGIN"

/**
 * Generate a 6-digit numeric OTP
 */
export function generateOtp(length: number = 6): string {
    const digits = "0123456789"
    let otp = ""
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}

/**
 * Send OTP via Email or SMS
 */
export async function sendOtp(identifier: string, token: string, type: OtpType): Promise<boolean> {
    try {
        console.log(`[OTP SYSTEM] Sending ${type} OTP to ${identifier}`)

        // 1. Email Handling via Resend
        if (identifier.includes("@")) {
            await sendOTPEmail(identifier, token)
            console.log(`[OTP SYSTEM] Email sent to ${identifier}`)
            return true
        }

        // 2. Phone Handling (Mock for now)
        // Check if it looks like a phone number (digits, plus sign, etc)
        const isPhone = /^[+\d\s-]+$/.test(identifier)

        if (isPhone) {
            // Integration Point: Twilio / Fast2SMS / MSG91
            // Example: await smsProvider.send(identifier, `Your OTP is ${token}`)

            console.log(`[OTP SYSTEM] 📱 MOCK SMS TO ${identifier}: "Your Rope Pro Academy OTP is ${token}"`)
            return true
        }

        return false

    } catch (error) {
        console.error("[OTP SYSTEM] Failed to send OTP:", error)
        return false
    }
}
