import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { decrypt, encrypt } from "@/lib/encryption"
import bcrypt from "bcrypt"

/**
 * GET /api/coach/profile
 * Fetch the current coach's profile data
 */
export async function GET() {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            )
        }

        console.log("📋 Fetching coach profile for:", session.user.email)

        // Find user
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

        // Verify coach role
        if (user.role !== "COACH") {
            return NextResponse.json(
                { error: "Access denied - Coach only" },
                { status: 403 }
            )
        }

        // Get coach profile
        const coach = await prisma.coach.findUnique({
            where: { userId: user.id },
        })

        if (!coach) {
            return NextResponse.json(
                { error: "Coach profile not found" },
                { status: 404 }
            )
        }

        // Decrypt sensitive fields
        const profileData = {
            email: user.email,
            role: user.role,
            status: user.status,
            memberSince: user.createdAt,

            // Coach specific data
            coachId: coach.coachId,
            fullName: coach.fullName,
            phone: coach.phone ? decrypt(coach.phone) : "",
            specialization: coach.primarySpecialization,
            experience: coach.experienceYears,
            certifications: coach.certifications,
            bio: coach.bio,
            photo: coach.photoUrl,
        }

        console.log("✅ Coach profile fetched successfully")

        return NextResponse.json({
            success: true,
            data: profileData
        })

    } catch (error) {
        console.error("❌ Error fetching coach profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/coach/profile
 * Update the current coach's profile data
 */
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            )
        }

        const body = await request.json()
        console.log("📝 Updating coach profile for:", session.user.email)

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

        // Verify coach role
        if (user.role !== "COACH") {
            return NextResponse.json(
                { error: "Access denied - Coach only" },
                { status: 403 }
            )
        }

        // Find coach profile
        const coach = await prisma.coach.findUnique({
            where: { userId: user.id },
        })

        if (!coach) {
            return NextResponse.json(
                { error: "Coach profile not found" },
                { status: 404 }
            )
        }

        const { fullName, phone, specialization, experience, certifications, bio, currentPassword, newPassword } = body

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

            // Build coach update data
            const coachUpdateData: Record<string, unknown> = {}

            if (fullName !== undefined) coachUpdateData.fullName = fullName
            if (specialization !== undefined) coachUpdateData.primarySpecialization = specialization
            if (experience !== undefined) coachUpdateData.experienceYears = experience
            if (certifications !== undefined) coachUpdateData.certifications = certifications
            if (bio !== undefined) coachUpdateData.bio = bio

            // Encrypt sensitive fields
            if (phone !== undefined) {
                coachUpdateData.phone = phone ? encrypt(phone) : null
            }

            // Update coach profile
            if (Object.keys(coachUpdateData).length > 0) {
                await tx.coach.update({
                    where: { id: coach.id },
                    data: coachUpdateData
                })
                console.log("   ✓ Coach profile updated")
            }
        })

        console.log("✅ Coach profile updated successfully")

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        })

    } catch (error) {
        console.error("❌ Error updating coach profile:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
