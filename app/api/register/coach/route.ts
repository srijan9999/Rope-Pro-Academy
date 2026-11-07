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

    try {
        // 1. Parse request body
        const body = await request.json()

        // 2. Validate with Zod
        const validationResult = coachFullRegistrationSchema.safeParse(body)

        if (!validationResult.success) {
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

        // 2.1 Explicit check for resumeUrl
        if (!data.resumeUrl || typeof data.resumeUrl !== "string" || data.resumeUrl.trim() === "") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "RESUME_REQUIRED",
                        message: "A valid resume URL is required to register as a coach.",
                    },
                },
                { status: 400 }
            )
        }

        // 3. Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
            select: { id: true },
        })

        if (existingUser) {
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
        const hashedPassword = await hashPassword(data.password)

        // 5. Generate unique coach ID
        const coachId = await generateCoachId()

        // 6. Create User + Coach in a strict transaction

        const result = await prisma.$transaction(async (tx) => {
            // Create User record
            const user = await tx.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    password: hashedPassword,
                    role: "COACH",
                    status: "PENDING",
                    mustChangePassword: false,
                },
            })

            // Create Coach profile
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

                    // Documents
                    resumeUrl: data.resumeUrl.trim(),
                    idProofUrl: data.idProofUrl || undefined,

                    // Application status
                    applicationStatus: "SUBMITTED",
                    verificationLevel: "LEVEL_1",
                    coachStatus: "INACTIVE",
                    isActive: false,
                },
            })

            return { user, coach }
        })

        // 7. Create audit log
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
                    resumeUrl: result.coach.resumeUrl,
                }),
            },
        })

        // 8. Create admin notification
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
        }


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

        if (error instanceof Error) {

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
