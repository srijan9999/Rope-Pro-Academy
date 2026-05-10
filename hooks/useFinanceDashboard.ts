import useSWR from 'swr'
import type { FinanceDashboardResponse } from '@/types/finance'

interface ApiResponse {
    success: boolean
    data: FinanceDashboardResponse
    error?: any
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useFinanceDashboard(period: string = 'month') {
    const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
        `/api/admin/finance?period=${period}&includeBreakdown=true`,
        fetcher,
        {
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: true
        }
    )

    return {
        dashboard: data?.data || {
            summary: {
                totalRevenue: 0,
                totalPending: 0,
                totalOverdue: 0,
                netRevenue: 0,
                monthlyRecurring: 0,
                collectionRate: 0,
                averageTransactionValue: 0
            },
            trends: {
                revenueGrowth: 0,
                overdueRate: 0
            },
            breakdown: null,
            recentTransactions: [],
            upcomingDues: [],
            overduePayments: []
        },
        isLoading,
        isError: error || (data && !data.success),
        refresh: mutate
    }
}
