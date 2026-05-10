import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        const body = await request.json()

        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
                { status: 404 }
            )
        }

        // Check for existing pending request
        const existingRequest = await prisma.iDCardRequest.findFirst({
            where: {
                studentId: student.id,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { success: false, error: { code: 'CONFLICT', message: 'You already have a pending replacement request' } },
                { status: 409 }
            )
        }

        // Validate required fields
        if (!body.request_type || !body.reason) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Request type and reason are required' } },
                { status: 400 }
            )
        }

        const validTypes = ['REPLACEMENT_LOST', 'REPLACEMENT_DAMAGED', 'REPLACEMENT_STOLEN']
        if (!validTypes.includes(body.request_type)) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid request type' } },
                { status: 400 }
            )
        }

        // Calculate replacement fee
        const feeMap: Record<string, number> = {
            REPLACEMENT_LOST: 200,
            REPLACEMENT_DAMAGED: 150,
            REPLACEMENT_STOLEN: 100,
        }

        const newRequest = await prisma.iDCardRequest.create({
            data: {
                studentId: student.id,
                requestType: body.request_type,
                reason: body.reason,
                urgency: body.urgency || 'NORMAL',
                lastSeenDate: body.last_seen_date ? new Date(body.last_seen_date) : null,
                lastSeenLocation: body.last_seen_location || null,
                policeReportFiled: body.police_report_filed || false,
                policeReportNumber: body.police_report_number || null,
                replacementFee: feeMap[body.request_type] || 200,
                status: 'PENDING',
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                id: newRequest.id,
                request_type: newRequest.requestType,
                status: newRequest.status,
                urgency: newRequest.urgency,
                replacement_fee: newRequest.replacementFee,
                created_at: newRequest.createdAt.toISOString(),
            },
            message: 'Replacement request submitted successfully',
            timestamp: new Date().toISOString()
        }, { status: 201 })

    } catch (error) {
        console.error('[Request Replacement Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit replacement request' } },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } },
                { status: 404 }
            )
        }

        const requests = await prisma.iDCardRequest.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        })

        return NextResponse.json({
            success: true,
            data: requests.map(r => ({
                id: r.id,
                request_type: r.requestType,
                reason: r.reason,
                status: r.status,
                urgency: r.urgency,
                replacement_fee: r.replacementFee,
                fee_paid: r.feePaid,
                created_at: r.createdAt.toISOString(),
                approved_at: r.approvedAt?.toISOString() || null,
                rejection_reason: r.rejectionReason,
            })),
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Get Replacement Requests Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch requests' } },
            { status: 500 }
        )
    }
}
