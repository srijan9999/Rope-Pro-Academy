import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requestQuerySchema } from '@/lib/validations/request'

// CRITICAL: Force dynamic to prevent Next.js caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch all requests with filters (Admin only)
export async function GET(request: Request) {
    try {
        console.log('[GET Requests] ====================================')
        console.log('[GET Requests] New request at:', new Date().toISOString())

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

        const { searchParams } = new URL(request.url)
        const queryParams = Object.fromEntries(searchParams.entries())
        console.log('[GET Requests] Query params:', queryParams)

        const validation = requestQuerySchema.safeParse(queryParams)

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid query parameters',
                        details: validation.error.flatten().fieldErrors
                    }
                },
                { status: 400 }
            )
        }

        const {
            status,
            type,
            priority,
            requesterRole,
            assignedTo,
            fromDate,
            toDate,
            page,
            limit,
            sortBy,
            sortOrder
        } = validation.data

        // Build where clause - STRICT FILTERING
        const where: any = {}

        // CRITICAL: If status is provided, ONLY return that status
        if (status) {
            const statuses = status.split(',')
            where.status = { in: statuses }
            console.log('[GET Requests] FILTERING by status:', statuses)
        } else {
            console.log('[GET Requests] WARNING: No status filter - returning ALL statuses')
        }

        if (type) {
            const types = type.split(',')
            where.type = { in: types }
        }

        if (priority) {
            const priorities = priority.split(',')
            where.priority = { in: priorities }
        }

        if (requesterRole) {
            const roles = requesterRole.split(',')
            where.requesterRole = { in: roles }
        }

        if (assignedTo) {
            where.assignedToId = assignedTo
        }

        if (fromDate) {
            where.createdAt = { ...where.createdAt, gte: new Date(fromDate) }
        }

        if (toDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(toDate) }
        }

        // Fetch requests with pagination
        const [requests, totalCount] = await Promise.all([
            prisma.request.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.request.count({ where })
        ])

        // Fetch requester details separately (since we don't have proper relations)
        const requesterIds = [...new Set(requests.map(r => r.requesterId))]
        const users = await prisma.user.findMany({
            where: { id: { in: requesterIds } },
            include: {
                student: { select: { fullName: true, photoUrl: true, studentId: true } },
                coach: { select: { fullName: true, photoUrl: true, coachId: true } },
                admin: { select: { fullName: true, photoUrl: true } }
            }
        })

        const userMap = new Map(users.map(u => [u.id, u]))

        // Enrich requests with computed fields
        const now = new Date()
        const enrichedRequests = requests.map(req => {
            const user = userMap.get(req.requesterId)
            const daysOpen = Math.floor(
                (now.getTime() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )

            const isOverdue =
                (req.status === 'PENDING' && daysOpen > 7) ||
                (req.priority === 'URGENT' && daysOpen > 1) ||
                (req.priority === 'HIGH' && daysOpen > 3)

            const profile = user?.student || user?.coach || user?.admin

            return {
                ...req,
                data: req.data ? JSON.parse(req.data) : null,
                attachments: req.attachments ? JSON.parse(req.attachments) : [],
                requester: {
                    id: user?.id,
                    email: user?.email,
                    role: user?.role,
                    profile: {
                        fullName: profile?.fullName || 'Unknown',
                        photoUrl: profile?.photoUrl,
                        studentId: user?.student?.studentId,
                        coachId: user?.coach?.coachId
                    }
                },
                daysOpen,
                isOverdue
            }
        })

        // Fetch stats
        const stats = await prisma.request.groupBy({
            by: ['status'],
            _count: true
        })

        const statsMap = stats.reduce((acc, s) => {
            acc[s.status] = s._count
            return acc
        }, {} as Record<string, number>)

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const totalToday = await prisma.request.count({
            where: { createdAt: { gte: todayStart } }
        })

        // Calculate avg resolution time
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const resolvedRequests = await prisma.request.findMany({
            where: {
                status: { in: ['APPROVED', 'REJECTED', 'RESOLVED'] },
                resolvedAt: { gte: thirtyDaysAgo }
            },
            select: { createdAt: true, resolvedAt: true }
        })

        const avgResolutionTime = resolvedRequests.length > 0
            ? resolvedRequests.reduce((acc, req) => {
                if (!req.resolvedAt) return acc
                const hours = (new Date(req.resolvedAt).getTime() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60)
                return acc + hours
            }, 0) / resolvedRequests.length
            : 0

        return NextResponse.json({
            success: true,
            data: {
                requests: enrichedRequests,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalRequests: totalCount,
                    requestsPerPage: limit
                },
                stats: {
                    pending: statsMap['PENDING'] || 0,
                    underReview: statsMap['UNDER_REVIEW'] || 0,
                    approved: statsMap['APPROVED'] || 0,
                    rejected: statsMap['REJECTED'] || 0,
                    totalToday,
                    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
                }
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Admin Requests GET Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch requests' } },
            { status: 500 }
        )
    }
}
