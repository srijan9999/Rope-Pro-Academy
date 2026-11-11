import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateCoachId } from "@/lib/auth"
import { coachFullRegistrationSchema } from "@/lib/validations/coach"
import { verifyResumeFileKey, deleteUploadedFile, isValidUploadThingKey } from "@/lib/uploadthing-server"

/**
 * POST /api/register/coach
 * Register a new coach with comprehensive profile
 * 
 * Creates User + Coach atomically in a transaction.
 * Sets application_status to SUBMITTED and verification_level to LEVEL_1.
 */
export async function POST(request: Request) {
    let resumeKey = ""
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

        // 2.1 Server-side verification of resume file key
        resumeKey = (data.resumeKey || "").trim()

        // If resumeKey was not passed directly, try extracting from resumeUrl
        if (!resumeKey && data.resumeUrl) {
            const raw = data.resumeUrl.trim()
            if (isValidUploadThingKey(raw)) {
                resumeKey = raw
            } else {
                const utMatch = raw.match(/https:\/\/(?:[a-zA-Z0-9_-]+\.ufs\.sh|utfs\.io)\/f\/([a-zA-Z0-9._-]+)/)
                if (utMatch && utMatch[1]) {
                    resumeKey = utMatch[1]
                }
            }
        }

        if (!resumeKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "RESUME_REQUIRED",
                        message: "A verified UploadThing resume file key is required to register as a coach.",
                    },
                },
                { status: 400 }
            )
        }

        // Verify that the file key actually exists in UploadThing and matches document format
        const verification = await verifyResumeFileKey(resumeKey)
        if (!verification.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "RESUME_VERIFICATION_FAILED",
                        message: verification.error || "The uploaded resume could not be verified in storage.",
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
                    resumeUrl: resumeKey,
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
        // Clean up orphaned upload if key is known
        if (typeof resumeKey === "string" && resumeKey) {
            await deleteUploadedFile(resumeKey).catch(() => { })
        }

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
