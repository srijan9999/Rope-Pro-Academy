import useSWR from 'swr'
import type { PlayerScheduleResponse } from '@/types/api'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePlayerSchedule(startDate: string, endDate: string) {
    // Only fetch if dates are provided
    const shouldFetch = startDate && endDate

    const { data, error, isLoading, mutate } = useSWR<PlayerScheduleResponse>(
        shouldFetch ? `/api/player/schedule?startDate=${startDate}&endDate=${endDate}` : null,
        fetcher
    )

    return {
        events: data?.data || [],
        isLoading,
        isError: error,
        refresh: mutate
    }
}
