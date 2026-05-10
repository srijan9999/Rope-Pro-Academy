import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

/**
 * GET /api/admin/profile
 * Fetch the current admin's profile data
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

        console.log("📋 Fetching admin profile for:", session.user.email)

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

        // Verify admin role
        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Access denied - Admin only" },
                { status: 403 }
            )
        }

        // Get admin profile
        const admin = await prisma.admin.findUnique({
            where: { userId: user.id },
        })

        const profileData = {
            email: user.email,
            role: user.role,
            status: user.status,
            memberSince: user.createdAt,

            // Admin specific data
            fullName: admin?.fullName || "",
            phone: admin?.phone || "",
        }

        console.log("✅ Admin profile fetched successfully")

        return NextResponse.json({
            success: true,
            data: profileData
        })

    } catch (error) {
        console.error("❌ Error fetching admin profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/admin/profile
 * Update the current admin's profile data
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
        console.log("📝 Updating admin profile for:", session.user.email)

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

        // Verify admin role
        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Access denied - Admin only" },
                { status: 403 }
            )
        }

        const { fullName, phone, currentPassword, newPassword } = body

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

            // Check if admin profile exists
            const existingAdmin = await tx.admin.findUnique({
                where: { userId: user.id }
            })

            const adminData = {
                fullName: fullName || undefined,
                phone: phone || undefined,
            }

            if (existingAdmin) {
                // Update existing admin profile
                await tx.admin.update({
                    where: { id: existingAdmin.id },
                    data: adminData
                })
            } else {
                // Create admin profile
                await tx.admin.create({
                    data: {
                        userId: user.id,
                        fullName: fullName || "Administrator",
                        phone: phone || undefined,
                    }
                })
            }

            console.log("   ✓ Admin profile updated")
        })

        console.log("✅ Admin profile updated successfully")

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        })

    } catch (error) {
        console.error("❌ Error updating admin profile:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
