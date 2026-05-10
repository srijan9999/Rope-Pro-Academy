import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import { parseUserDirectoryQuery } from "@/lib/validations/admin"
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

        console.log("👥 ADMIN USERS - Query params:", { query, role, status, academy, page, limit, sortBy, sortOrder })

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

        console.log(`✅ ADMIN USERS - Found ${totalCount} users, returning page ${page}/${totalPages}`)

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
