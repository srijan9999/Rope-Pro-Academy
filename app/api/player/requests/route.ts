import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPlayerRequestSchema } from '@/lib/validations/request'

export async function POST(request: Request) {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        // 2. Verify user is a student
        if (session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Only students can create requests' } },
                { status: 403 }
            )
        }

        // 3. Parse and validate input
        const body = await request.json()
        const validationResult = createPlayerRequestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: validationResult.error.flatten().fieldErrors
                    }
                },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // 4. Get student details
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                academy: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                coach: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
                { status: 404 }
            )
        }

        // 5. Additional validation for leave requests
        if (data.type === 'LEAVE' || data.type === 'MEDICAL_LEAVE') {
            const leaveData = data.data as {
                startDate: string
                endDate: string
                daysDuration: number
            }



            // To define a more robust overlap check without complex JSON filtering:
            // Fetch active requests and check logic in application layer
            const activeRequests = await prisma.request.findMany({
                where: {
                    requesterId: session.user.id,
                    type: { in: ['LEAVE', 'MEDICAL_LEAVE'] },
                    status: { in: ['PENDING', 'APPROVED'] },
                    createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Check last 90 days
                }
            })

            const newStart = new Date(leaveData.startDate).getTime()
            const newEnd = new Date(leaveData.endDate).getTime()

            const hasOverlap = activeRequests.some(req => {
                if (!req.data) return false
                try {
                    const reqData = JSON.parse(req.data)
                    const start = new Date(reqData.startDate).getTime()
                    const end = new Date(reqData.endDate).getTime()
                    return (newStart <= end && newEnd >= start)
                } catch (e) {
                    return false
                }
            })

            if (hasOverlap) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'OVERLAPPING_LEAVE',
                            message: 'You already have a leave request for this period'
                        }
                    },
                    { status: 409 }
                )
            }

            // Check if leave is too far in the future (max 90 days)
            const daysDiff = Math.ceil(
                (new Date(leaveData.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysDiff > 90) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'LEAVE_TOO_FAR',
                            message: 'Leave requests can only be submitted up to 90 days in advance'
                        }
                    },
                    { status: 400 }
                )
            }
        }

        // 6. Create request record
        const newRequest = await prisma.request.create({
            data: {
                requesterId: session.user.id,
                requesterRole: 'STUDENT',
                type: data.type,
                category: data.category,
                subject: data.subject,
                description: data.description,
                priority: data.priority,
                data: JSON.stringify(data.data), // Ensure stored as string for Prisma
                status: 'PENDING',
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            }
        })

        // 7. Notify coach and admin
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', status: 'ACTIVE' }
        })

        const notifications = []

        // Notify student's coach if assigned
        if (student.coach) {
            notifications.push({
                userId: student.coach.id,
                title: `Leave Request from ${student.fullName}`,
                message: `${student.fullName} has submitted a ${data.type.toLowerCase().replace('_', ' ')} request`,
                type: 'INFO',
                category: 'REQUEST',
                relatedId: newRequest.id,
                relatedType: 'REQUEST',
                metadata: JSON.stringify({
                    studentId: student.id,
                    studentName: student.fullName,
                    requestType: data.type
                })
            })
        }

        // Notify all admins
        admins.forEach(admin => {
            notifications.push({
                userId: admin.id,
                title: `New ${data.type} Request`,
                message: `${student.fullName} from ${student.academy?.name || 'Unknown Academy'} submitted a ${data.type.toLowerCase().replace('_', ' ')} request`,
                type: 'INFO',
                category: 'REQUEST',
                relatedId: newRequest.id,
                relatedType: 'REQUEST',
                metadata: JSON.stringify({
                    studentId: student.id,
                    studentName: student.fullName,
                    requestType: data.type,
                    priority: data.priority
                })
            })
        })

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications
            })
        }

        // 8. Log action (non-blocking)
        try {
            await prisma.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: 'CREATE',
                    entityType: 'REQUEST',
                    entityId: newRequest.id,
                    newValue: JSON.stringify(newRequest),
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown'
                }
            })
        } catch (logError) {
            console.error('[Audit Log Error]:', logError)
            // Continue execution - do not fail the request
        }

        return NextResponse.json({
            success: true,
            data: {
                request: newRequest,
                message: 'Request submitted successfully'
            },
            timestamp: new Date().toISOString()
        }, { status: 201 })

    } catch (error) {
        console.error('[Player Create Request Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create request' } },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status')?.split(',')
        const typeFilter = searchParams.get('type')?.split(',')
        const limit = Number(searchParams.get('limit')) || 10

        const where = {
            requesterId: session.user.id,
            ...(statusFilter ? { status: { in: statusFilter } } : {}),
            ...(typeFilter ? { type: { in: typeFilter } } : {})
        }

        const [requests, stats] = await Promise.all([
            prisma.request.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            }),

            prisma.request.groupBy({
                by: ['status'],
                where: { requesterId: session.user.id },
                _count: true
            })
        ])

        const statsMap = stats.reduce((acc, s) => {
            acc[s.status.toLowerCase()] = s._count
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            success: true,
            data: {
                requests,
                stats: {
                    pending: statsMap['pending'] || 0,
                    approved: statsMap['approved'] || 0,
                    rejected: statsMap['rejected'] || 0,
                    total: requests.length
                }
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Get Player Requests Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch requests' } },
            { status: 500 }
        )
    }
}
