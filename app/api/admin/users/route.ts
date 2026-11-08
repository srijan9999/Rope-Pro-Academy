import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, generateCoachId, generateStudentId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseUserDirectoryQuery } from "@/lib/validations/admin"
import { hashDefaultPassword } from "@/lib/default-password"
import type { UserDirectoryResponse, PaginatedUser, UserProfile } from "@/types/api"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
    try {
        // 1. Session validation
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                    timestamp: new Date().toISOString()
                },
                { status: 401 }
            )
        }

        // 2. Role authorization
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Admin access required' },
                    timestamp: new Date().toISOString()
                },
                { status: 403 }
            )
        }

        // 3. Parse and validate query parameters
        const { searchParams } = new URL(request.url)
        const parseResult = parseUserDirectoryQuery(searchParams)

        if (!parseResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid query parameters',
                        details: parseResult.error.flatten()
                    },
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            )
        }

        const { query, role, status, academy, page, limit, sortBy, sortOrder } = parseResult.data


        // 4. Build dynamic where clause
        const whereConditions: Prisma.UserWhereInput[] = []

        // Role filter
        if (role) {
            whereConditions.push({ role })
        }

        // Status filter
        if (status) {
            whereConditions.push({ status })
        }

        // Search filter (email, student name, coach name)
        if (query && query.length >= 2) {
            whereConditions.push({
                OR: [
                    { email: { contains: query } },
                    { student: { fullName: { contains: query } } },
                    { coach: { fullName: { contains: query } } },
                    { admin: { fullName: { contains: query } } }
                ]
            })
        }

        // Academy filter
        if (academy) {
            whereConditions.push({
                OR: [
                    { student: { academyId: academy } }
                    // Coaches have assignedAcademies as JSON - would need custom handling
                ]
            })
        }

        const where: Prisma.UserWhereInput = whereConditions.length > 0
            ? { AND: whereConditions }
            : {}

        // 5. Build orderBy
        const orderBy: Prisma.UserOrderByWithRelationInput = { [sortBy]: sortOrder }

        // 6. Execute queries in parallel
        const skip = (page - 1) * limit

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    lastLogin: true,
                    student: {
                        select: {
                            fullName: true,
                            photoUrl: true,
                            phone: true,
                            studentId: true,
                            skillLevel: true,
                            totalMedals: true,
                            academy: {
                                select: { id: true, name: true }
                            },
                            batch: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                    coach: {
                        select: {
                            fullName: true,
                            photoUrl: true,
                            phone: true,
                            coachId: true,
                            primarySpecialization: true
                        }
                    },
                    admin: {
                        select: {
                            fullName: true,
                            photoUrl: true,
                            phone: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ])

        // 7. Transform to response format
        const paginatedUsers: PaginatedUser[] = users.map(user => {
            let profile: UserProfile = { fullName: 'Unknown' }

            if (user.student) {
                profile = {
                    fullName: user.student.fullName,
                    photoUrl: user.student.photoUrl,
                    phone: user.student.phone,
                    studentId: user.student.studentId,
                    academy: user.student.academy,
                    batch: user.student.batch,
                    skillLevel: user.student.skillLevel,
                    totalMedals: user.student.totalMedals
                }
            } else if (user.coach) {
                profile = {
                    fullName: user.coach.fullName,
                    photoUrl: user.coach.photoUrl,
                    phone: user.coach.phone,
                    coachId: user.coach.coachId,
                    specialization: user.coach.primarySpecialization
                }
            } else if (user.admin) {
                profile = {
                    fullName: user.admin.fullName,
                    photoUrl: user.admin.photoUrl,
                    phone: user.admin.phone
                }
            }

            return {
                id: user.id,
                email: user.email,
                role: user.role as 'STUDENT' | 'COACH' | 'ADMIN',
                status: user.status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
                createdAt: user.createdAt.toISOString(),
                lastLogin: user.lastLogin?.toISOString() || null,
                profile
            }
        })

        // 8. Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit)

        const response: UserDirectoryResponse = {
            success: true,
            data: {
                users: paginatedUsers,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers: totalCount,
                    usersPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filters: {
                    query,
                    role: role as 'STUDENT' | 'COACH' | 'ADMIN' | undefined,
                    status: status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | undefined,
                    academy,
                    sortBy,
                    sortOrder
                }
            },
            timestamp: new Date().toISOString()
        }


        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error("❌ ADMIN USERS ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                },
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/users
 * Admin-only user creation (Coach or Student).
 * Uses DEFAULT_TEMP_PASSWORD from environment variables (hashed), never exposed in logs/responses.
 * Sets mustChangePassword to true.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Session and admin role verification
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { role, email, fullName, phone, photoUrl, specialization, experienceYears, bio, resumeUrl } = body

        if (!email || !fullName || !role) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, fullName, and role are required' } },
                { status: 400 }
            )
        }

        if (role !== 'COACH' && role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_ROLE', message: 'Role must be COACH or STUDENT' } },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: { id: true }
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } },
                { status: 409 }
            )
        }

        // Hash default temporary password server-side only
        const hashedPassword = await hashDefaultPassword()

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    role,
                    status: 'ACTIVE',
                    mustChangePassword: true,
                }
            })

            if (role === 'COACH') {
                const coachId = await generateCoachId()
                const coach = await tx.coach.create({
                    data: {
                        coachId,
                        userId: user.id,
                        fullName: fullName.trim(),
                        email: email.toLowerCase().trim(),
                        phone: phone || null,
                        photoUrl: photoUrl || null,
                        primarySpecialization: specialization || 'SPEED',
                        experienceYears: Number(experienceYears) || 0,
                        bio: bio || null,
                        resumeUrl: resumeUrl || '',
                        applicationStatus: 'APPROVED',
                        verificationLevel: 'LEVEL_1',
                        coachStatus: 'ACTIVE',
                        isActive: true,
                        isApproved: true,
                    }
                })
                return { user, coach }
            } else {
                const studentId = await generateStudentId()
                const student = await tx.student.create({
                    data: {
                        studentId,
                        userId: user.id,
                        fullName: fullName.trim(),
                        phone: phone || null,
                        photoUrl: photoUrl || null,
                        skillLevel: 'BEGINNER',
                        registrationStatus: 'VERIFIED',
                    }
                })
                return { user, student }
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'CREATE',
                entityType: role,
                entityId: result.user.id,
                newValue: JSON.stringify({
                    email: result.user.email,
                    role: result.user.role,
                    createdBy: session.user.id,
                })
            }
        })

        return NextResponse.json({
            success: true,
            message: `${role} account created successfully with default temporary credentials`,
            data: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                status: result.user.status,
            }
        }, { status: 201 })
    } catch (error: unknown) {
        console.error("❌ ADMIN CREATE USER ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create user account' } },
            { status: 500 }
        )
    }
}
