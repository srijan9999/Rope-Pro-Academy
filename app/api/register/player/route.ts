import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

/**
 * POST /api/register/player
 * Register a new student/player
 * 
 * STRICT TRANSACTION: User + Student created together or neither.
 */
export async function POST(request: Request) {
    console.log("═══════════════════════════════════════════════════════")
    console.log("📝 [1/7] PLAYER REGISTRATION STARTED")
    console.log("═══════════════════════════════════════════════════════")

    try {
        // Parse request body
        const body = await request.json()
        console.log("📦 [2/7] Received Body:", JSON.stringify(body, null, 2))

        // Destructure required fields
        const {
            email,
            password,
            fullName,
            dob,
            gender,
            phone,
            schoolName,
            parentName,
            parentPhone,
            parentEmail,
            bloodGroup,
            medicalConditions,
            emergencyContact,
            preferredLocation,
            skillLevel = "BEGINNER",
        } = body

        // ============================================
        // VALIDATION
        // ============================================

        // Check required fields
        if (!email || !password || !fullName) {
            console.log("❌ VALIDATION ERROR: Missing required fields")
            return NextResponse.json(
                { error: "Email, password, and full name are required" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            console.log("❌ VALIDATION ERROR: Invalid email format:", email)
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 6) {
            console.log("❌ VALIDATION ERROR: Password too short")
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // ============================================
        // DATE CONVERSION
        // ============================================

        console.log("📅 [3/7] Received Date of Birth (raw):", dob)

        let dateOfBirth: Date | null = null
        if (dob) {
            dateOfBirth = new Date(dob)
            if (isNaN(dateOfBirth.getTime())) {
                console.log("❌ DATE ERROR: Invalid date format:", dob)
                return NextResponse.json(
                    { error: "Invalid date of birth format. Use YYYY-MM-DD" },
                    { status: 400 }
                )
            }
            console.log("✅ Converted Date:", dateOfBirth.toISOString())
        }

        // ============================================
        // CHECK EXISTING USER
        // ============================================

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            console.log("❌ DUPLICATE ERROR: Email already registered:", email)
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            )
        }

        // ============================================
        // GENERATE IDs
        // ============================================

        const hashedPassword = await bcrypt.hash(password, 10)
        const year = new Date().getFullYear()
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const studentId = `RPA-${year}-${randomNum}`

        console.log("🔑 [4/7] Generated Student ID:", studentId)

        // ============================================
        // DATABASE TRANSACTION (STRICT)
        // ============================================

        console.log("💾 [5/7] TRANSACTION STARTED - Creating User + Student...")

        const result = await prisma.$transaction(async (tx) => {
            // Step 1: Create User
            console.log("   → Creating User record...")
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    role: "STUDENT",
                    status: "PENDING", // Requires admin approval
                },
            })
            console.log("   ✓ User created with ID:", user.id)

            // Step 2: Create Student (linked to User)
            console.log("   → Creating Student record...")
            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    studentId: studentId,
                    fullName: fullName.trim(),
                    dateOfBirth: dateOfBirth,
                    gender: gender?.toUpperCase() || null,
                    phone: phone || null,
                    schoolName: schoolName || null,
                    parentName: parentName || null,
                    parentPhone: parentPhone || null,
                    parentEmail: parentEmail || null,
                    bloodGroup: bloodGroup || null,
                    medicalConditions: medicalConditions || null,
                    emergencyContact: emergencyContact || null,
                    skillLevel: skillLevel,
                    // academyId: preferredLocation || null, // Uncomment if you want to link to academy
                },
            })
            console.log("   ✓ Student created with ID:", student.id)
            console.log("   ✓ Student public ID:", student.studentId)

            return { user, student }
        })

        console.log("✅ [6/7] TRANSACTION COMMITTED SUCCESSFULLY")
        console.log("═══════════════════════════════════════════════════════")
        console.log("🎉 [7/7] REGISTRATION COMPLETE!")
        console.log("   User ID:", result.user.id)
        console.log("   Student ID:", result.student.studentId)
        console.log("═══════════════════════════════════════════════════════")

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Registration successful! Your application is pending approval.",
                data: {
                    studentId: result.student.studentId,
                    email: result.user.email,
                    status: result.user.status,
                },
            },
            { status: 201 }
        )

    } catch (error: unknown) {
        // ============================================
        // ERROR HANDLING
        // ============================================

        console.error("═══════════════════════════════════════════════════════")
        console.error("❌ REGISTRATION CRASHED!")
        console.error("═══════════════════════════════════════════════════════")

        if (error instanceof Error) {
            console.error("Error Name:", error.name)
            console.error("Error Message:", error.message)
            console.error("Error Stack:", error.stack)

            // Check for Prisma-specific errors
            if (error.message.includes("Unique constraint")) {
                return NextResponse.json(
                    { error: "This email is already registered" },
                    { status: 409 }
                )
            }
        } else {
            console.error("Unknown error:", error)
        }

        return NextResponse.json(
            { error: "Registration failed. Please try again." },
            { status: 500 }
        )
    }
}
