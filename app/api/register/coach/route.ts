import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateCoachId } from "@/lib/auth"
import { coachFullRegistrationSchema } from "@/lib/validations/coach"

/**
 * POST /api/register/coach
 * Register a new coach with comprehensive profile
 * 
 * Creates User + Coach atomically in a transaction.
 * Sets application_status to SUBMITTED and verification_level to LEVEL_1.
 */
export async function POST(request: Request) {
    console.log("═══════════════════════════════════════════════════════")
    console.log("🏋️ [1/7] COACH REGISTRATION STARTED")
    console.log("═══════════════════════════════════════════════════════")

    try {
        // 1. Parse request body
        const body = await request.json()
        console.log("📦 [2/7] Received registration data")

        // 2. Validate with Zod
        const validationResult = coachFullRegistrationSchema.safeParse(body)

        if (!validationResult.success) {
            console.log("❌ VALIDATION ERROR:", validationResult.error.flatten().fieldErrors)
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid registration data",
                        details: validationResult.error.flatten().fieldErrors,
                    },
                },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // 3. Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
            select: { id: true },
        })

        if (existingUser) {
            console.log("❌ DUPLICATE: Email already registered:", data.email)
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "EMAIL_EXISTS",
                        message: "An account with this email already exists",
                    },
                },
                { status: 409 }
            )
        }

        // 4. Hash password
        console.log("🔑 [3/7] Hashing password...")
        const hashedPassword = await hashPassword(data.password)

        // 5. Generate unique coach ID
        const coachId = await generateCoachId()
        console.log("🆔 [4/7] Generated Coach ID:", coachId)

        // 6. Create User + Coach in a strict transaction
        console.log("💾 [5/7] TRANSACTION STARTED - Creating User + Coach...")

        const result = await prisma.$transaction(async (tx) => {
            // Create User record
            console.log("   → Creating User record...")
            const user = await tx.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    password: hashedPassword,
                    role: "COACH",
                    status: "PENDING",
                },
            })
            console.log("   ✓ User created with ID:", user.id)

            // Create Coach profile
            console.log("   → Creating Coach profile...")
            const coach = await tx.coach.create({
                data: {
                    coachId,
                    userId: user.id,
                    fullName: data.fullName.trim(),
                    email: data.email.toLowerCase(),
                    phone: data.phone,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                    gender: data.gender,

                    // Address
                    addressLine1: data.addressLine1,
                    addressLine2: data.addressLine2 || undefined,
                    city: data.city,
                    state: data.state,
                    postalCode: data.postalCode,

                    // Professional
                    primarySpecialization: data.specializations[0] || "SPEED",
                    experienceYears: data.experienceYears,
                    bio: data.bio,
                    education: data.education || undefined,
                    previousExperience: data.previousExperience || undefined,

                    // Skills (stored as JSON strings)
                    skillLevels: JSON.stringify(data.skillLevels),
                    languages: JSON.stringify(data.languages),
                    ageGroups: JSON.stringify(data.ageGroups),

                    // Availability
                    availableDays: JSON.stringify(data.availableDays),
                    availableTimes: data.availableTimes ? JSON.stringify(data.availableTimes) : undefined,
                    employmentType: data.employmentType,
                    maxBatches: data.maxBatches || 3,

                    // Application status
                    applicationStatus: "SUBMITTED",
                    verificationLevel: "LEVEL_1",
                    coachStatus: "INACTIVE",
                    isActive: false,
                },
            })
            console.log("   ✓ Coach created with ID:", coach.coachId)

            return { user, coach }
        })

        // 7. Create audit log
        console.log("📝 [6/7] Creating audit log...")
        await prisma.auditLog.create({
            data: {
                userId: result.user.id,
                action: "CREATE",
                entityType: "COACH",
                entityId: result.coach.id,
                newValue: JSON.stringify({
                    coachId: result.coach.coachId,
                    email: result.user.email,
                    specialization: data.specializations,
                    experience: data.experienceYears,
                }),
            },
        })

        // 8. Create admin notification
        console.log("🔔 Creating admin notification...")
        try {
            // Find admin users to notify
            const admins = await prisma.user.findMany({
                where: { role: "ADMIN" },
                select: { id: true },
                take: 5,
            })

            for (const admin of admins) {
                await prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title: "New Coach Application",
                        message: `${data.fullName} has applied as a coach (${data.specializations.join(", ")}, ${data.experienceYears}yr experience)`,
                        type: "INFO",
                        category: "SYSTEM",
                        actionUrl: "/dashboard/admin/coaches",
                    },
                })
            }
        } catch (notifError) {
            // Non-critical: don't fail registration if notification fails
            console.warn("⚠️ Could not create admin notification:", notifError)
        }

        console.log("═══════════════════════════════════════════════════════")
        console.log("🎉 [7/7] COACH REGISTRATION COMPLETE!")
        console.log("   User ID:", result.user.id)
        console.log("   Coach ID:", result.coach.coachId)
        console.log("═══════════════════════════════════════════════════════")

        // Return success
        return NextResponse.json(
            {
                success: true,
                message: "Registration successful! Your application is under review.",
                data: {
                    coachId: result.coach.coachId,
                    email: result.user.email,
                    status: result.user.status,
                    applicationStatus: result.coach.applicationStatus,
                },
            },
            { status: 201 }
        )
    } catch (error: unknown) {
        console.error("═══════════════════════════════════════════════════════")
        console.error("❌ COACH REGISTRATION CRASHED!")
        console.error("═══════════════════════════════════════════════════════")

        if (error instanceof Error) {
            console.error("Error:", error.message)
            console.error("Stack:", error.stack)

            if (error.message.includes("Unique constraint")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: "DUPLICATE_ERROR",
                            message: "This email is already registered",
                        },
                    },
                    { status: 409 }
                )
            }
        } else {
            console.error("Unknown error:", error)
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Registration failed. Please try again later.",
                },
            },
            { status: 500 }
        )
    }
}
