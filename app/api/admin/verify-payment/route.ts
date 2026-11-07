import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to prevent Next.js caching
export const dynamic = 'force-dynamic'

interface VerifyPaymentBody {
    studentId: string
    action: 'APPROVE' | 'REJECT'
    note?: string
}

// POST - Approve or reject a payment screenshot
export async function POST(request: Request) {
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

        const body = (await request.json()) as VerifyPaymentBody
        const { studentId, action, note } = body

        // Validate required fields
        if (!studentId || !action) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'studentId and action are required' } },
                { status: 400 }
            )
        }

        if (action !== 'APPROVE' && action !== 'REJECT') {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'action must be APPROVE or REJECT' } },
                { status: 400 }
            )
        }

        // Fetch the student with their user relation
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } },
                { status: 404 }
            )
        }

        if (student.registrationStatus !== 'SCREENSHOT_UPLOADED') {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_STATE',
                        message: `Student registration status is '${student.registrationStatus}', expected 'SCREENSHOT_UPLOADED'`,
                    },
                },
                { status: 400 }
            )
        }

        const adminId = session.user.id

        if (action === 'APPROVE') {
            // Use a transaction to ensure all updates succeed together
            await prisma.$transaction([
                // Update student registration status
                prisma.student.update({
                    where: { id: studentId },
                    data: {
                        registrationStatus: 'VERIFIED',
                        paymentVerifiedAt: new Date(),
                        paymentVerifiedBy: adminId,
                        paymentNote: note || null,
                    },
                }),

                // Update user status to ACTIVE since payment is now verified
                prisma.user.update({
                    where: { id: student.userId },
                    data: {
                        status: 'ACTIVE',
                    },
                }),

                // Create notification for the student
                prisma.notification.create({
                    data: {
                        userId: student.userId,
                        title: 'Payment Verified',
                        message:
                            'Your registration payment has been verified successfully. Your account is now active.',
                        type: 'SUCCESS',
                        category: 'SYSTEM',
                        relatedId: studentId,
                        relatedType: 'STUDENT',
                    },
                }),

                // Create audit log
                prisma.auditLog.create({
                    data: {
                        userId: adminId,
                        action: 'UPDATE',
                        entityType: 'STUDENT',
                        entityId: studentId,
                        newValue: JSON.stringify({
                            registrationStatus: 'VERIFIED',
                            paymentVerifiedBy: adminId,
                            note: note || null,
                        }),
                    },
                }),
            ])

            return NextResponse.json({
                success: true,
                data: {
                    message: 'Payment approved successfully. Student account is now active.',
                    studentId,
                    action: 'APPROVE',
                },
            })
        } else {
            // REJECT flow
            await prisma.$transaction([
                // Update student registration status to REJECTED
                prisma.student.update({
                    where: { id: studentId },
                    data: {
                        registrationStatus: 'REJECTED',
                        paymentNote: note || null,
                    },
                }),

                // Keep user status as PENDING_PAYMENT (no change needed)

                // Create notification for the student
                prisma.notification.create({
                    data: {
                        userId: student.userId,
                        title: 'Payment Rejected',
                        message: note
                            ? `Your registration payment was rejected. Reason: ${note}`
                            : 'Your registration payment was rejected. Please upload a valid payment screenshot.',
                        type: 'WARNING',
                        category: 'SYSTEM',
                        relatedId: studentId,
                        relatedType: 'STUDENT',
                    },
                }),

                // Create audit log
                prisma.auditLog.create({
                    data: {
                        userId: adminId,
                        action: 'UPDATE',
                        entityType: 'STUDENT',
                        entityId: studentId,
                        newValue: JSON.stringify({
                            registrationStatus: 'REJECTED',
                            note: note || null,
                        }),
                    },
                }),
            ])

            return NextResponse.json({
                success: true,
                data: {
                    message: 'Payment rejected. Student has been notified.',
                    studentId,
                    action: 'REJECT',
                },
            })
        }
    } catch (error) {
        console.error('[Admin Verify Payment POST Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process payment verification' } },
            { status: 500 }
        )
    }
}
