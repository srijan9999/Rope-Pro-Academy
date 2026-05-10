import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import { createAcademySchema } from "@/lib/validations/academy"

export async function GET(request: Request) {
    try {
        // 1. Authentication
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

        // 2. Parse query parameters
        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status')?.split(',')
        const typeFilter = searchParams.get('type')
        const sortBy = searchParams.get('sortBy') || 'name'
        const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

        console.log("🏫 ACADEMIES - Fetching with filters:", { statusFilter, typeFilter, sortBy, sortOrder })

        // 3. Build where clause
        const whereConditions: Record<string, unknown>[] = []

        if (statusFilter && statusFilter.length > 0) {
            whereConditions.push({ status: { in: statusFilter } })
        }

        if (typeFilter) {
            whereConditions.push({ academyType: typeFilter })
        }

        const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

        // 4. Fetch academies with counts
        const academies = await prisma.academy.findMany({
            where,
            include: {
                headCoach: {
                    select: {
                        id: true,
                        fullName: true,
                        photoUrl: true,
                        primarySpecialization: true
                    }
                },
                _count: {
                    select: {
                        students: true,
                        batches: true
                    }
                }
            },
            orderBy: { [sortBy]: sortOrder }
        })

        // 5. Calculate stats
        const totalCapacity = academies.reduce((sum, a) => sum + a.capacity, 0)
        const totalStudents = academies.reduce((sum, a) => sum + a._count.students, 0)

        const enrichedAcademies = academies.map(academy => ({
            ...academy,
            utilization: academy.capacity > 0
                ? Math.round((academy._count.students / academy.capacity) * 100)
                : 0
        }))

        const stats = {
            totalAcademies: academies.length,
            activeAcademies: academies.filter(a => a.status === 'ACTIVE').length,
            totalCapacity,
            totalStudents,
            averageUtilization: academies.length > 0
                ? Math.round(enrichedAcademies.reduce((sum, a) => sum + a.utilization, 0) / academies.length)
                : 0
        }

        console.log("✅ ACADEMIES - Fetched", academies.length, "academies")

        return NextResponse.json({
            success: true,
            data: {
                academies: enrichedAcademies,
                stats
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("❌ ACADEMIES GET ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch academies' } },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        // 2. Parse and validate input
        const body = await request.json()
        const validationResult = createAcademySchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationResult.error.flatten().fieldErrors
                    }
                },
                { status: 400 }
            )
        }

        const data = validationResult.data
        console.log("🏫 ACADEMIES - Creating:", data.name)

        // 3. Check for duplicate name
        const existingName = await prisma.academy.findUnique({
            where: { name: data.name }
        })

        if (existingName) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DUPLICATE_NAME',
                        message: `Academy "${data.name}" already exists`
                    }
                },
                { status: 409 }
            )
        }

        // 4. Check for duplicate email (if provided)
        if (data.contactEmail) {
            const existingEmail = await prisma.academy.findUnique({
                where: { contactEmail: data.contactEmail }
            })

            if (existingEmail) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'DUPLICATE_EMAIL',
                            message: `Email ${data.contactEmail} is already registered`
                        }
                    },
                    { status: 409 }
                )
            }
        }

        // 5. Validate head coach if provided
        if (data.headCoachId) {
            const coach = await prisma.coach.findUnique({
                where: { id: data.headCoachId },
                include: { headOfAcademy: true }
            })

            if (!coach) {
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: 'COACH_NOT_FOUND', message: 'Selected coach does not exist' }
                    },
                    { status: 404 }
                )
            }

            if (coach.headOfAcademy) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'COACH_ALREADY_HEAD',
                            message: `This coach is already head of "${coach.headOfAcademy.name}"`
                        }
                    },
                    { status: 409 }
                )
            }
        }

        // 6. Create academy
        const academy = await prisma.academy.create({
            data: {
                name: data.name,
                location: data.location,
                address: data.address,
                description: data.description,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail,
                locationLat: data.locationLat,
                locationLng: data.locationLng,
                headCoachId: data.headCoachId,
                capacity: data.capacity,
                academyType: data.academyType,
                operatingHours: data.operatingHours ? JSON.stringify(data.operatingHours) : null,
                facilities: data.facilities ? JSON.stringify(data.facilities) : null,
                status: 'ACTIVE'
            },
            include: {
                headCoach: {
                    select: {
                        id: true,
                        fullName: true,
                        photoUrl: true,
                        primarySpecialization: true
                    }
                },
                _count: {
                    select: {
                        students: true,
                        batches: true
                    }
                }
            }
        })

        console.log("✅ ACADEMIES - Created:", academy.name, academy.id)

        return NextResponse.json({
            success: true,
            data: {
                academy,
                message: `Academy "${academy.name}" created successfully`
            },
            timestamp: new Date().toISOString()
        }, { status: 201 })

    } catch (error) {
        console.error("❌ ACADEMIES POST ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create academy' } },
            { status: 500 }
        )
    }
}
