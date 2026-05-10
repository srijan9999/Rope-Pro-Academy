import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log("📩 QUICK LEAD - Received Data:", body)

        const { name, phone, age, preferredLocation } = body

        // Validate required fields
        if (!name || !phone || !age || !preferredLocation) {
            console.log("❌ QUICK LEAD - Validation failed: Missing required fields")
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            )
        }

        // Validate phone number (basic check)
        if (phone.length < 10) {
            console.log("❌ QUICK LEAD - Validation failed: Invalid phone")
            return NextResponse.json(
                { error: "Please enter a valid phone number." },
                { status: 400 }
            )
        }

        console.log("✅ QUICK LEAD - Validation passed, saving to database...")

        // Create the lead in database
        const lead = await prisma.quickLead.create({
            data: {
                name: name.trim(),
                phone: phone.trim(),
                age: age.trim(),
                preferredLocation: preferredLocation.trim(),
                status: "PENDING",
            },
        })

        console.log("✅ QUICK LEAD - Saved successfully! ID:", lead.id)

        return NextResponse.json(
            {
                message: "Received! Our team will contact you soon.",
                leadId: lead.id
            },
            { status: 201 }
        )
    } catch (error) {
        // Log the full error for debugging
        console.error("❌ QUICK LEAD ERROR:", error)

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
            { error: errorMessage },
            { status: 500 }
        )
    }
}
