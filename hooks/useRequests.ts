'use client'

import useSWR from 'swr'
import { useToast } from '@/hooks/use-toast'

interface RequesterProfile {
    fullName: string
    photoUrl?: string
    studentId?: string
    coachId?: string
}

interface Request {
    id: string
    type: string
    category?: string
    subject: string
    description: string
    data: any
    status: string
    priority: string
    requesterRole: string
    adminNote?: string
    attachments: string[]
    createdAt: string
    updatedAt: string
    reviewedAt?: string
    resolvedAt?: string
    requester: {
        id: string
        email: string
        role: string
        profile: RequesterProfile
    }
    daysOpen: number
    isOverdue: boolean
}

interface RequestStats {
    pending: number
    underReview: number
    approved: number
    rejected: number
    totalToday: number
    avgResolutionTime: number
}

interface RequestsResponse {
    success: true
    data: {
        requests: Request[]
        pagination: {
            currentPage: number
            totalPages: number
            totalRequests: number
            requestsPerPage: number
        }
        stats: RequestStats
    }
}

interface RequestFilters {
    status?: string
    type?: string
    priority?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}

// Fetcher with NO CACHE
const fetcher = async (url: string) => {
    console.log('[useRequests] Fetching:', url)
    const res = await fetch(url, {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    })
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error?.message || 'Failed to fetch')
    }
    const data = await res.json()
    console.log('[useRequests] Fetched', data?.data?.requests?.length, 'requests with statuses:',
        data?.data?.requests?.map((r: any) => r.status).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i))
    return data
}

export function useRequests(filters: RequestFilters = {}) {
    const { toast } = useToast()

    // Build params - removed timestamp as it causes infinite re-renders
    // Cache busting is handled by force-dynamic on server and no-cache headers in fetcher
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value))
        }
    })

    const { data, error, isLoading, mutate } = useSWR<RequestsResponse>(
        `/api/admin/requests?${params.toString()}`,
        fetcher,
        {
            refreshInterval: 30000,
            revalidateOnFocus: true,
            dedupingInterval: 2000,  // Allow some deduplication
            revalidateOnMount: true
        }
    )

    const updateRequestStatus = async (
        requestId: string,
        action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW',
        adminNote?: string
    ) => {
        // Store previous data for rollback
        const previousData = data

        try {
            // Optimistic update - immediately update UI
            await mutate(
                (current) => {
                    if (!current) return current

                    // Find the request being updated to know its current status
                    const targetRequest = current.data.requests.find(r => r.id === requestId)
                    const currentStatus = targetRequest?.status || 'PENDING'

                    // Calculate new stats based on action
                    const newStats = { ...current.data.stats }

                    // Decrement from current status
                    if (currentStatus === 'PENDING') {
                        newStats.pending = Math.max(0, newStats.pending - 1)
                    } else if (currentStatus === 'UNDER_REVIEW') {
                        newStats.underReview = Math.max(0, newStats.underReview - 1)
                    }

                    // Increment based on action
                    if (action === 'APPROVE') {
                        newStats.approved = (newStats.approved || 0) + 1
                    } else if (action === 'REJECT') {
                        newStats.rejected = (newStats.rejected || 0) + 1
                    } else if (action === 'UNDER_REVIEW') {
                        newStats.underReview = (newStats.underReview || 0) + 1
                    }

                    return {
                        ...current,
                        data: {
                            ...current.data,
                            requests: current.data.requests.filter(r => r.id !== requestId),
                            stats: newStats
                        }
                    }
                },
                { revalidate: false } // Don't revalidate - keep optimistic state
            )

            const response = await fetch(`/api/admin/requests/${requestId}/action`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, adminNote })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Action failed')
            }

            toast({
                title: 'Success',
                description: result.data.message
            })

            // Delayed revalidation for eventual consistency (after 2 seconds)
            setTimeout(() => mutate(), 2000)

        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive'
            })
            // Rollback on error - restore previous data
            mutate(previousData, false)
            throw err
        }
    }

    return {
        requests: data?.data?.requests ?? [],
        stats: data?.data?.stats,
        pagination: data?.data?.pagination,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        refresh: mutate,
        updateRequestStatus
    }
}

export type { Request, RequestStats, RequestFilters }
