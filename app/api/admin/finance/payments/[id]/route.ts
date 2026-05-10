import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { generateReceiptNumber } from '@/lib/utils/invoice'
import { generateReceiptPDF } from '@/lib/utils/receipt-generator'

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> } // Next.js 15
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const { id } = await context.params
        const body = await request.json()
        const { status, paymentMode, paymentDate, transactionId, notes } = body

        // Define type for payment with relations
        type PaymentWithRelations = Prisma.PaymentGetPayload<{
            include: {
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        fullName: true,
                        photoUrl: true,
                        userId: true
                    }
                },
                academy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        }>

        // Fetch existing payment
        const existingPayment = await prisma.payment.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        fullName: true,
                        photoUrl: true,
                        userId: true // Needed for notification
                    }
                },
                academy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        }) as PaymentWithRelations | null

        if (!existingPayment) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } },
                { status: 404 }
            )
        }

        // If marking as PAID, generate receipt
        let receiptNumber = existingPayment.receiptNumber
        let receiptUrl = existingPayment.receiptUrl

        if (status === 'PAID' && existingPayment.status !== 'PAID') {
            receiptNumber = await generateReceiptNumber()

            const updatedPayment = await prisma.payment.update({
                where: { id },
                data: {
                    status: 'PAID', // Explicitly set status to enum string
                    paymentMode,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    transactionId,
                    receiptNumber,
                    notes: notes || undefined
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            photoUrl: true
                        }
                    },
                    academy: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })

            // Generate PDF receipt
            receiptUrl = await generateReceiptPDF(updatedPayment)

            // Update payment with receipt URL
            await prisma.payment.update({
                where: { id },
                data: { receiptUrl }
            })

            // Update student totals
            await prisma.student.update({
                where: { id: existingPayment.studentId },
                data: {
                    lastPaymentDate: new Date(paymentDate || new Date()),
                    totalPaid: {
                        increment: existingPayment.netAmount
                    },
                    totalPending: {
                        decrement: existingPayment.netAmount
                    }
                }
            })

            // Send notification
            await prisma.notification.create({
                data: {
                    userId: existingPayment.student.userId,
                    title: 'Payment Confirmed',
                    message: `Your payment of ₹${existingPayment.netAmount} has been confirmed. Receipt: ${receiptNumber}`,
                    type: 'SUCCESS',
                    category: 'FEE',
                    relatedId: existingPayment.id,
                    relatedType: 'PAYMENT'
                }
            })

            return NextResponse.json({
                success: true,
                data: {
                    payment: {
                        ...updatedPayment,
                        status,
                        receiptNumber,
                        receiptUrl
                    },
                    message: 'Payment updated successfully'
                }
            })
        }

        // Handle generic update if not status change (or if already paid) - simplistic fallback
        const simpleUpdate = await prisma.payment.update({
            where: { id },
            data: {
                notes: notes || undefined
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                payment: simpleUpdate,
                message: 'Payment updated successfully'
            }
        })

    } catch (error) {
        console.error('[Update Payment Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update payment' } },
            { status: 500 }
        )
    }
}
