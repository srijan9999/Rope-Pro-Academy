'use client'

import useSWR from 'swr'
import { useMemo, useCallback } from 'react'
import type { UserDirectoryResponse } from '@/types/api'

interface UserFiltersParams {
    query?: string
    role?: string
    status?: string
    academy?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error?.message || 'Failed to fetch')
    }
    return res.json()
}

/**
 * Hook for fetching paginated user directory with filters
 */
export function useUserDirectory(filters: UserFiltersParams) {
    // Build query string from filters
    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
                params.append(key, String(value))
            }
        })
        return params.toString()
    }, [filters])

    const { data, error, isLoading, mutate } = useSWR<UserDirectoryResponse, Error>(
        `/api/admin/users?${queryString}`,
        fetcher,
        {
            keepPreviousData: true, // Smooth transitions between pages
            revalidateOnFocus: false, // Don't refetch on tab focus
            dedupingInterval: 2000
        }
    )

    const refresh = useCallback(() => {
        mutate()
    }, [mutate])

    return {
        users: data?.data?.users ?? [],
        pagination: data?.data?.pagination,
        appliedFilters: data?.data?.filters,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        refresh
    }
}
