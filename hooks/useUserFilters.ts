'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export interface UserFilterState {
    query: string
    role: string
    status: string
    academy: string
    page: number
    limit: number
    sortBy: string
    sortOrder: 'asc' | 'desc'
}

/**
 * Hook for managing user directory filters via URL state
 * Enables shareable filter links and browser history support
 */
export function useUserFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const filters: UserFilterState = useMemo(() => ({
        query: searchParams.get('query') ?? '',
        role: searchParams.get('role') ?? '',
        status: searchParams.get('status') ?? '',
        academy: searchParams.get('academy') ?? '',
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 20,
        sortBy: searchParams.get('sortBy') ?? 'createdAt',
        sortOrder: (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'
    }), [searchParams])

    const updateFilters = useCallback((updates: Partial<UserFilterState>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value === '' || value === undefined || value === null) {
                params.delete(key)
            } else {
                params.set(key, String(value))
            }
        })

        // Reset to page 1 when filters change (except when explicitly changing page)
        if (!('page' in updates) && Object.keys(updates).length > 0) {
            params.set('page', '1')
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [router, pathname, searchParams])

    const resetFilters = useCallback(() => {
        router.push(pathname, { scroll: false })
    }, [router, pathname])

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.query ||
            filters.role ||
            filters.status ||
            filters.academy ||
            filters.page > 1
        )
    }, [filters])

    return {
        filters,
        updateFilters,
        resetFilters,
        hasActiveFilters
    }
}
