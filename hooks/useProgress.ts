import useSWR from 'swr'
import type { ProgressResponse } from '@/types/api'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useProgress() {
    const { data, error, isLoading, mutate } = useSWR<ProgressResponse>(
        '/api/player/progress?includeHistory=true&includeTrends=true',
        fetcher,
        {
            refreshInterval: 120000, // Refresh every 2 minutes
            revalidateOnFocus: true
        }
    )

    const emptyProgress: ProgressResponse['data'] = {
        currentReport: null,
        history: [],
        trends: null,
        milestones: { achieved: [], upcoming: [] },
        stats: {
            totalReports: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            recentImprovement: 0
        }
    }

    return {
        progress: data?.data || emptyProgress,
        isLoading,
        isError: error,
        refresh: mutate
    }
}
