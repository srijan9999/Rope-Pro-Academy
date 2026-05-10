import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { decrypt, encrypt } from "@/lib/encryption"
import bcrypt from "bcrypt"

/**
 * GET /api/player/profile
 * Fetch the current user's profile data
 */
export async function GET() {
    try {
        // Get the current session
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            )
        }

        console.log("📋 Fetching profile for:", session.user.email)

        // Find user and their student profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Get student profile
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        if (!student) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            )
        }

        // Decrypt sensitive fields
        const decryptedProfile = {
            // User data
            email: user.email,
            role: user.role,
            status: user.status,
            memberSince: user.createdAt,

            // Student data
            studentId: student.studentId,
            fullName: student.fullName,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            schoolName: student.schoolName,

            // Decrypted sensitive data
            phone: student.phone ? decrypt(student.phone) : "",
            emergencyContact: student.emergencyContact ? decrypt(student.emergencyContact) : "",
            medicalConditions: student.medicalConditions ? decrypt(student.medicalConditions) : "",

            // Other fields
            bloodGroup: student.bloodGroup,
            parentName: student.parentName,
            parentPhone: student.parentPhone ? decrypt(student.parentPhone) : "",
            parentEmail: student.parentEmail,
            skillLevel: student.skillLevel,
        }

        console.log("✅ Profile fetched successfully for:", student.studentId)

        return NextResponse.json({
            success: true,
            data: decryptedProfile
        })

    } catch (error) {
        console.error("❌ Error fetching profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/player/profile
 * Update the current user's profile data
 */
export async function PATCH(request: Request) {
    try {
        // Get the current session
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            )
        }

        const body = await request.json()
        console.log("📝 Updating profile for:", session.user.email)
        console.log("📦 Update data:", Object.keys(body))

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Find student profile
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        if (!student) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            )
        }

        // Destructure allowed fields (email change is NOT allowed)
        const {
            fullName,
            dateOfBirth,
            gender,
            schoolName,
            phone,
            emergencyContact,
            medicalConditions,
            bloodGroup,
            parentName,
            parentPhone,
            parentEmail,
            currentPassword, // Required for password change
            newPassword, // New password to set
        } = body

        // Check for email change attempt
        if (body.email && body.email !== user.email) {
            return NextResponse.json(
                { error: "Email cannot be changed" },
                { status: 400 }
            )
        }

        // Password change logic with current password verification
        if (newPassword) {
            // Require current password when changing password
            if (!currentPassword) {
                return NextResponse.json(
                    { error: "Current password is required to change password" },
                    { status: 400 }
                )
            }

            // Verify new password meets minimum requirements
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: "New password must be at least 6 characters" },
                    { status: 400 }
                )
            }

            // Verify current password is correct
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: "Incorrect current password" },
                    { status: 403 }
                )
            }

            console.log("   ✓ Current password verified")
        }

        // Update in transaction
        await prisma.$transaction(async (tx) => {
            // Update password if provided and verified
            if (newPassword && newPassword.length >= 6) {
                const hashedPassword = await bcrypt.hash(newPassword, 10)
                await tx.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                })
                console.log("   ✓ Password updated")
            }

            // Build student update data
            const studentUpdateData: Record<string, unknown> = {}

            if (fullName !== undefined) studentUpdateData.fullName = fullName
            if (gender !== undefined) studentUpdateData.gender = gender?.toUpperCase()
            if (schoolName !== undefined) studentUpdateData.schoolName = schoolName
            if (bloodGroup !== undefined) studentUpdateData.bloodGroup = bloodGroup
            if (parentName !== undefined) studentUpdateData.parentName = parentName
            if (parentEmail !== undefined) studentUpdateData.parentEmail = parentEmail

            // Handle date conversion
            if (dateOfBirth !== undefined) {
                const dob = new Date(dateOfBirth)
                if (!isNaN(dob.getTime())) {
                    studentUpdateData.dateOfBirth = dob
                }
            }

            // Encrypt sensitive fields
            if (phone !== undefined) {
                studentUpdateData.phone = phone ? encrypt(phone) : null
            }
            if (emergencyContact !== undefined) {
                studentUpdateData.emergencyContact = emergencyContact ? encrypt(emergencyContact) : null
            }
            if (medicalConditions !== undefined) {
                studentUpdateData.medicalConditions = medicalConditions ? encrypt(medicalConditions) : null
            }
            if (parentPhone !== undefined) {
                studentUpdateData.parentPhone = parentPhone ? encrypt(parentPhone) : null
            }

            // Update student profile
            if (Object.keys(studentUpdateData).length > 0) {
                await tx.student.update({
                    where: { id: student.id },
                    data: studentUpdateData
                })
                console.log("   ✓ Student profile updated")
            }
        })

        console.log("✅ Profile updated successfully")

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        })

    } catch (error) {
        console.error("❌ Error updating profile:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
