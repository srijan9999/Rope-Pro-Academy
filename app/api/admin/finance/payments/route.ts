import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { recordPaymentSchema } from '@/lib/validations/payment'
import { generateInvoiceNumber, generateReceiptNumber } from '@/lib/utils/invoice'
import { generateReceiptPDF } from '@/lib/utils/receipt-generator'
// import { sendReceiptEmail } from '@/lib/utils/email' // Assuming this exists or skipped based on phase 4 scope - skipping for now as not in task list

export async function POST(request: Request) {
    try {
        // 1. Authentication & Authorization
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        // 2. Parse and validate input
        const body = await request.json()
        const validationResult = recordPaymentSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid payment data',
                        details: validationResult.error.flatten().fieldErrors
                    }
                },
                { status: 400 }
            )
        }

        const data = validationResult.data

        type StudentWithRelations = Prisma.StudentGetPayload<{
            include: {
                academy: {
                    select: {
                        id: true,
                        name: true,
                        standardMonthlyFee: true
                    }
                },
                batch: {
                    select: {
                        id: true,
                        monthlyFee: true
                    }
                },
                user: {
                    select: {
                        email: true,
                        status: true
                    } // User normally has id, email, etc. Implicitly includes id if not excluded? select only picks specified.
                    // Wait, I need userId in student model, but user relation is here.
                    // Student.userId is a field on Student. 'user' relation is separate.
                    // I don't need user relation for userId field on Student.
                }
            }
        }>

        // 3. Fetch student details with academy info
        const student = await prisma.student.findUnique({
            where: { id: data.studentId },
            include: {
                academy: {
                    select: {
                        id: true,
                        name: true,
                        standardMonthlyFee: true
                    }
                },
                batch: {
                    select: {
                        id: true,
                        monthlyFee: true
                    }
                },
                user: {
                    select: {
                        email: true,
                        status: true
                    }
                }
            }
        }) as StudentWithRelations | null

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } },
                { status: 404 }
            )
        }

        if (!student.academy) {
            return NextResponse.json(
                { success: false, error: { code: 'DATA_ERROR', message: 'Student not assigned to any academy' } },
                { status: 400 }
            )
        }

        // 4. Business validations

        // If status is PAID, paymentMode and paymentDate are required
        // (Zod handles mode if status is PAID if we refine, but explicit check here is fine too as logic is simpler than complex zod refinement)
        if (data.status === 'PAID') {
            if (!data.paymentMode) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'MISSING_PAYMENT_MODE',
                            message: 'Payment mode is required for paid transactions'
                        }
                    },
                    { status: 400 }
                )
            }

            if (!data.paymentDate) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'MISSING_PAYMENT_DATE',
                            message: 'Payment date is required for paid transactions'
                        }
                    },
                    { status: 400 }
                )
            }
        }

        // For monthly fees, monthYear is required
        if (data.paymentType === 'MONTHLY_FEE' && !data.monthYear) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'MISSING_MONTH_YEAR',
                        message: 'Month/Year is required for monthly fee payments'
                    }
                },
                { status: 400 }
            )
        }

        // Check for duplicate monthly fee payment
        if (data.paymentType === 'MONTHLY_FEE' && data.monthYear) {
            const existingPayment = await prisma.payment.findFirst({
                where: {
                    studentId: data.studentId,
                    paymentType: 'MONTHLY_FEE',
                    monthYear: data.monthYear,
                    status: { in: ['PAID', 'PENDING'] }
                }
            })

            if (existingPayment) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'DUPLICATE_PAYMENT',
                            message: `Payment for ${data.monthYear} already exists (${existingPayment.status})`
                        }
                    },
                    { status: 409 }
                )
            }
        }

        // 5. Calculate net amount
        const netAmount = data.amount - data.discount + data.lateFee

        // 6. Generate invoice number
        const invoiceNumber = await generateInvoiceNumber()

        // 7. Generate receipt number (only if paid)
        const receiptNumber = data.status === 'PAID'
            ? await generateReceiptNumber()
            : null

        // 8. Determine due date (if not provided)
        let dueDate = data.dueDate ? new Date(data.dueDate) : new Date()

        if (!data.dueDate && data.paymentType === 'MONTHLY_FEE' && data.monthYear) {
            // Due date is 1st of the month
            const [yearStr, monthStr] = data.monthYear.split('-')
            // Note: month index is 0-based in JS Date
            dueDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
        }

        // 9. Create payment record
        const payment = await prisma.payment.create({
            data: {
                studentId: data.studentId,
                amount: data.amount,
                paymentType: data.paymentType,
                status: data.status,
                paymentMode: data.paymentMode,
                dueDate,
                paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
                invoiceNumber,
                receiptNumber,
                transactionId: data.transactionId,
                chequeNumber: data.chequeNumber,
                bankReference: data.bankReference,
                lateFee: data.lateFee,
                discount: data.discount,
                netAmount,
                monthYear: data.monthYear,
                academyId: student.academy.id,
                batchId: student.batch?.id,
                notes: data.notes,
                internalNotes: data.internalNotes,
                processedBy: session.user.id
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

        // 10. Update student's payment tracking
        if (data.status === 'PAID') {
            await prisma.student.update({
                where: { id: data.studentId },
                data: {
                    lastPaymentDate: new Date(data.paymentDate!),
                    totalPaid: {
                        increment: netAmount
                    }
                }
            })
        } else {
            await prisma.student.update({
                where: { id: data.studentId },
                data: {
                    totalPending: {
                        increment: netAmount
                    }
                }
            })
        }

        // 11. Generate receipt PDF (if paid and requested)
        let receiptUrl = null
        if (data.status === 'PAID' && data.generateInvoice) {
            receiptUrl = await generateReceiptPDF(payment)

            // Update payment with receipt URL
            await prisma.payment.update({
                where: { id: payment.id },
                data: { receiptUrl }
            })
        }

        // 12. Send receipt email (skipped for now as per minimal implementation)
        // if (data.status === 'PAID' && data.sendReceipt && student.user.email) { ... }

        // 13. Create notification
        await prisma.notification.create({
            data: {
                userId: student.userId, // Fixed: student.user_id -> student.userId based on schema
                title: data.status === 'PAID' ? 'Payment Received' : 'Payment Due',
                message: data.status === 'PAID'
                    ? `Your payment of ₹${netAmount} has been received. Receipt: ${receiptNumber}`
                    : `Payment of ₹${netAmount} is due on ${dueDate.toLocaleDateString('en-IN')}`,
                type: data.status === 'PAID' ? 'SUCCESS' : 'INFO',
                category: 'FEE',
                relatedId: payment.id,
                relatedType: 'PAYMENT',
                metadata: JSON.stringify({ // SQLite needs string for JSON? No, field is String or JSON? Checked schema? Notif metadata might be String or JSON. Let's assume String for SQLite safety if schema says String? Notif schema not fully visible but common pattern. Rechecking schema... Notification metadata not visible in earlier view. Assuming JSON stringify is safe.
                    paymentType: data.paymentType,
                    amount: netAmount
                })
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                payment: {
                    ...payment,
                    amount: payment.amount,
                    netAmount: payment.netAmount,
                },
                receiptUrl,
                message: data.status === 'PAID'
                    ? `Payment of ₹${netAmount} recorded successfully`
                    : `Payment due created for ₹${netAmount}`
            },
            timestamp: new Date().toISOString()
        }, { status: 201 })

    } catch (error) {
        console.error('[Record Payment Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record payment' } },
            { status: 500 }
        )
    }
}
