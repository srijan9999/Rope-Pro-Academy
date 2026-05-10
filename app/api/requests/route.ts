import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    createRequestSchema,
    leaveRequestDataSchema,
    profileUpdateDataSchema,
    transferRequestDataSchema
} from '@/lib/validations/request'

// GET - Fetch user's own requests
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const type = searchParams.get('type')

        const requests = await prisma.request.findMany({
            where: {
                requesterId: session.user.id,
                ...(status && { status }),
                ...(type && { type })
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return NextResponse.json({
            success: true,
            data: { requests },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[User Requests GET Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch requests' } },
            { status: 500 }
        )
    }
}

// POST - Submit new request
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validation = createRequestSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: validation.error.flatten().fieldErrors
                    }
                },
                { status: 400 }
            )
        }

        const data = validation.data

        // Validate type-specific data
        if (data.type === 'LEAVE' || data.type === 'MEDICAL_LEAVE') {
            const leaveValidation = leaveRequestDataSchema.safeParse(data.data)
            if (!leaveValidation.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'INVALID_LEAVE_DATA',
                            message: 'Invalid leave request data',
                            details: leaveValidation.error.flatten().fieldErrors
                        }
                    },
                    { status: 400 }
                )
            }
        }

        if (data.type === 'PROFILE_UPDATE') {
            const profileValidation = profileUpdateDataSchema.safeParse(data.data)
            if (!profileValidation.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'INVALID_PROFILE_DATA',
                            message: 'Invalid profile update data',
                            details: profileValidation.error.flatten().fieldErrors
                        }
                    },
                    { status: 400 }
                )
            }
        }

        if (data.type === 'ACADEMY_TRANSFER' || data.type === 'BATCH_TRANSFER') {
            const transferValidation = transferRequestDataSchema.safeParse(data.data)
            if (!transferValidation.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'INVALID_TRANSFER_DATA',
                            message: 'Invalid transfer request data',
                            details: transferValidation.error.flatten().fieldErrors
                        }
                    },
                    { status: 400 }
                )
            }
        }

        // Get requester role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        // Create request
        const newRequest = await prisma.request.create({
            data: {
                requesterId: session.user.id,
                requesterRole: user?.role || 'STUDENT',
                type: data.type,
                category: data.category,
                subject: data.subject,
                description: data.description,
                priority: data.priority,
                data: data.data ? JSON.stringify(data.data) : null,
                attachments: data.attachments ? JSON.stringify(data.attachments) : null,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            }
        })

        // Notify admins
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        })

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: `New ${data.type.replace('_', ' ')} Request`,
                    message: `${session.user.email} submitted a new request`,
                    type: 'INFO',
                    category: 'REQUEST',
                    relatedId: newRequest.id,
                    relatedType: 'REQUEST',
                    metadata: JSON.stringify({
                        requestType: data.type,
                        priority: data.priority
                    })
                }))
            })
        }

        // Log the action
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

        return NextResponse.json({
            success: true,
            data: {
                request: newRequest,
                message: 'Request submitted successfully'
            },
            timestamp: new Date().toISOString()
        }, { status: 201 })

    } catch (error) {
        console.error('[Create Request Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create request' } },
            { status: 500 }
        )
    }
}
