'use client'

import useSWR from 'swr'
import type { DashboardStatsResponse, ApiErrorResponse } from '@/types/api'

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error?.message || 'Failed to fetch')
    }
    return res.json()
}

/**
 * Hook for fetching admin dashboard statistics
 * Auto-refreshes every 30 seconds
 */
export function useAdminDashboard() {
    const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse, Error>(
        '/api/admin/dashboard',
        fetcher,
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000
        }
    )

    return {
        stats: data?.data?.stats,
        recentRegistrations: data?.data?.recentRegistrations,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        refresh: mutate
    }
}
