import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single request details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        const { id: requestId } = await params

        const requestRecord = await prisma.request.findUnique({
            where: { id: requestId }
        })

        if (!requestRecord) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } },
                { status: 404 }
            )
        }

        // Get requester details
        const requester = await prisma.user.findUnique({
            where: { id: requestRecord.requesterId },
            include: {
                student: {
                    select: {
                        fullName: true,
                        photoUrl: true,
                        studentId: true,
                        academy: { select: { id: true, name: true } },
                        batch: { select: { id: true, name: true } }
                    }
                },
                coach: {
                    select: {
                        fullName: true,
                        photoUrl: true,
                        coachId: true
                    }
                }
            }
        })

        // Get reviewer details if reviewed
        let reviewer = null
        if (requestRecord.reviewedById) {
            reviewer = await prisma.user.findUnique({
                where: { id: requestRecord.reviewedById },
                include: {
                    admin: { select: { fullName: true } }
                }
            })
        }

        const profile = requester?.student || requester?.coach

        return NextResponse.json({
            success: true,
            data: {
                request: {
                    ...requestRecord,
                    data: requestRecord.data ? JSON.parse(requestRecord.data) : null,
                    attachments: requestRecord.attachments ? JSON.parse(requestRecord.attachments) : [],
                    requester: {
                        id: requester?.id,
                        email: requester?.email,
                        role: requester?.role,
                        profile: {
                            fullName: profile?.fullName || 'Unknown',
                            photoUrl: profile?.photoUrl,
                            studentId: requester?.student?.studentId,
                            coachId: requester?.coach?.coachId,
                            academy: requester?.student?.academy,
                            batch: requester?.student?.batch
                        }
                    },
                    reviewedBy: reviewer ? {
                        id: reviewer.id,
                        fullName: reviewer.admin?.fullName
                    } : null
                }
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Admin Request GET Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch request' } },
            { status: 500 }
        )
    }
}
