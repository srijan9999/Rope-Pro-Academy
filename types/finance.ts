// Types matching the API response structure

export type PaymentType =
    | 'MONTHLY_FEE'
    | 'REGISTRATION_FEE'
    | 'RE_REGISTRATION_FEE'
    | 'EVENT_FEE'
    | 'COMPETITION_FEE'
    | 'MERCHANDISE'
    | 'WORKSHOP_FEE'
    | 'PRIVATE_COACHING'
    | 'LATE_FEE'
    | 'OTHER'

export type PaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'OVERDUE'
    | 'PARTIALLY_PAID'
    | 'CANCELLED'
    | 'REFUNDED'

export type PaymentMode =
    | 'CASH'
    | 'ONLINE'
    | 'UPI'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'BANK_TRANSFER'
    | 'CHEQUE'
    | 'OTHER'

export interface SummaryStats {
    totalRevenue: number
    totalPending: number
    totalOverdue: number
    netRevenue: number
    monthlyRecurring: number
    collectionRate: number
    averageTransactionValue: number
}

export interface BreakdownStats {
    byType: Array<{
        type: PaymentType
        amount: number
        count: number
        percentage: number
    }>
    byAcademy: Array<{
        academyId: string
        academyName: string
        revenue: number
        count: number
        percentage: number
    }>
    byMonth: Array<{
        month: string
        revenue: number
        payments: number
    }>
    byStatus: Record<string, number>
}

export interface TrendsStats {
    revenueGrowth: number
    overdueRate: number
}

export interface Transaction {
    id: string
    invoiceNumber: string
    student: {
        id: string
        studentId: string
        fullName: string
        photoUrl?: string | null
    }
    academy: {
        id: string
        name: string
    }
    amount: number
    netAmount: number
    paymentType: PaymentType
    status: PaymentStatus
    paymentMode?: PaymentMode | null
    paymentDate?: string | null
    dueDate: string
    monthYear?: string | null
    daysOverdue?: number
    createdAt: string
    lateFee: number
    discount: number
    receiptNumber?: string | null
    receiptUrl?: string | null
}

export interface UpcomingDue {
    studentId: string
    studentName: string
    amount: number
    dueDate: string
    daysUntilDue: number
}

export interface OverduePayment {
    id: string
    student: {
        id: string
        fullName: string
    }
    amount: number
    dueDate: string
    daysOverdue: number
    remindersSent: number
}

export interface FinanceDashboardResponse {
    summary: SummaryStats
    breakdown: BreakdownStats | null
    trends: TrendsStats
    recentTransactions: Transaction[]
    upcomingDues: UpcomingDue[]
    overduePayments: OverduePayment[]
}
