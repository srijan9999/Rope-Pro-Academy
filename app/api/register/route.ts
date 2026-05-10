import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateStudentId, generateCoachId } from "@/lib/auth"
import { registrationSchema, formatZodErrors } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

/**
 * POST /api/register
 * Register a new student or coach
 * 
 * Rate limiting should be implemented in production (e.g., using upstash/ratelimit)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input using Zod
        const validationResult = registrationSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: formatZodErrors(validationResult.error),
                },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
            select: { id: true },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password)

        // Create user and profile in a transaction
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create base user
            const user = await tx.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    password: hashedPassword,
                    role: data.role, // String: "STUDENT" or "COACH"
                    status: "PENDING", // Requires admin approval
                },
            })

            if (data.role === "STUDENT") {
                // Generate unique student ID
                const studentId = await generateStudentId()

                // Create student profile
                const student = await tx.student.create({
                    data: {
                        studentId,
                        userId: user.id,
                        fullName: data.fullName,
                        dateOfBirth: data.dateOfBirth
                            ? new Date(data.dateOfBirth)
                            : undefined,
                        gender: data.gender, // String: "MALE", "FEMALE", "OTHER"
                        phone: data.phone,
                        parentName: data.parentName,
                        parentPhone: data.parentPhone,
                        parentEmail: data.parentEmail || undefined,
                        schoolName: data.schoolName,
                        grade: data.grade,
                        academyId: data.academyId,
                        skillLevel: data.skillLevel || "BEGINNER",
                        bloodGroup: data.bloodGroup,
                        medicalConditions: data.medicalConditions,
                    },
                })

                return {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                    },
                    profile: {
                        id: student.id,
                        studentId: student.studentId,
                        fullName: student.fullName,
                    },
                }
            } else if (data.role === "COACH") {
                // Generate unique coach ID
                const coachId = await generateCoachId()

                // Create coach profile
                const coach = await tx.coach.create({
                    data: {
                        coachId,
                        userId: user.id,
                        fullName: data.fullName,
                        dateOfBirth: data.dateOfBirth
                            ? new Date(data.dateOfBirth)
                            : undefined,
                        gender: data.gender, // String: "MALE", "FEMALE", "OTHER"
                        phone: data.phone,
                        email: data.email.toLowerCase(),
                        address: data.address,
                        experienceYears: data.experienceYears || 0,
                        coachingYears: data.coachingYears || 0,
                        primarySpecialization: data.specialization || "SPEED",
                        qualifications: data.qualifications,
                        ropeSkippingJourney: data.ropeSkippingJourney,
                        coachingPhilosophy: data.coachingPhilosophy,
                    },
                })

                return {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                    },
                    profile: {
                        id: coach.id,
                        coachId: coach.coachId,
                        fullName: coach.fullName,
                    },
                }
            }

            throw new Error("Invalid role")
        })

        // Log registration (audit trail)
        await prisma.auditLog.create({
            data: {
                userId: result.user.id,
                action: "CREATE",
                entityType: data.role === "STUDENT" ? "STUDENT" : "COACH",
                entityId: result.profile.id,
                newValue: JSON.stringify({
                    email: result.user.email,
                    role: result.user.role,
                    profileId:
                        data.role === "STUDENT"
                            ? (result.profile as { studentId: string }).studentId
                            : (result.profile as { coachId: string }).coachId,
                }),
            },
        })

        // TODO: Send verification email
        // TODO: Notify admin of new registration

        return NextResponse.json(
            {
                message: "Registration successful",
                user: result.user,
                profile: result.profile,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)

        // Handle Prisma unique constraint errors
        if (
            error instanceof Error &&
            error.message.includes("Unique constraint")
        ) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        )
    }
}
