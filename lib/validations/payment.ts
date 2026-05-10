import { z } from 'zod'

export const recordPaymentSchema = z.object({
    studentId: z.string().cuid(),

    amount: z.coerce.number().min(0).max(1000000),
    paymentType: z.enum([
        'MONTHLY_FEE', 'REGISTRATION_FEE', 'RE_REGISTRATION_FEE',
        'EVENT_FEE', 'COMPETITION_FEE', 'MERCHANDISE',
        'WORKSHOP_FEE', 'PRIVATE_COACHING', 'LATE_FEE', 'OTHER'
    ]),

    status: z.enum(['PENDING', 'PAID']),
    paymentMode: z.enum([
        'CASH', 'ONLINE', 'UPI', 'CREDIT_CARD',
        'DEBIT_CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'
    ]).optional(),

    dueDate: z.string().optional(),  // Auto-generated if not provided
    paymentDate: z.string().optional(),  // Required if status = PAID

    discount: z.coerce.number().min(0).default(0),
    lateFee: z.coerce.number().min(0).default(0),

    transactionId: z.string().optional(),
    chequeNumber: z.string().optional(),
    bankReference: z.string().optional(),

    monthYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),  // For monthly fees

    notes: z.string().optional(),
    internalNotes: z.string().optional(),

    generateInvoice: z.boolean().default(true),
    sendReceipt: z.boolean().default(false)  // Email receipt to parent
})

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
