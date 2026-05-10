import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log("📩 CONTACT FORM - Received Data:", body)

        const { firstName, lastName, email, phone, message } = body

        // Validate required fields
        if (!firstName || !email || !message) {
            console.log("❌ CONTACT FORM - Validation failed: Missing required fields")
            return NextResponse.json(
                { success: false, error: "First name, email, and message are required." },
                { status: 400 }
            )
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            console.log("❌ CONTACT FORM - Validation failed: Invalid email format")
            return NextResponse.json(
                { success: false, error: "Please enter a valid email address." },
                { status: 400 }
            )
        }

        console.log("✅ CONTACT FORM - Validation passed, saving to database...")

        // Create the contact message in database
        const contactMessage = await prisma.contactMessage.create({
            data: {
                firstName: firstName.trim(),
                lastName: lastName?.trim() || null,
                email: email.trim().toLowerCase(),
                phone: phone?.trim() || null,
                message: message.trim(),
                status: "UNREAD",
            },
        })

        console.log("✅ CONTACT FORM - Saved successfully! ID:", contactMessage.id)

        return NextResponse.json(
            {
                success: true,
                message: "Message sent successfully!",
                id: contactMessage.id
            },
            { status: 201 }
        )
    } catch (error) {
        // Log the full error for debugging
        console.error("❌ CONTACT FORM ERROR:", error)

        // Extract meaningful error message
        let errorMessage = "Something went wrong. Please try again."

        if (error instanceof Error) {
            // Check for common Prisma errors
            if (error.message.includes("does not exist")) {
                errorMessage = "Database table not found. Please run: npx prisma db push"
            } else if (error.message.includes("SQLITE_ERROR")) {
                errorMessage = "Database error. Please run: npx prisma db push"
            } else {
                errorMessage = error.message
            }
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        )
    }
}
