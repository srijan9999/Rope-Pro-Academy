import useSWR from 'swr'

interface BatchStats {
    averageAttendance: number
    studentsOnTrack: number
    studentsNeedingAttention: number
    totalRecords: number
}

interface Academy {
    id: string
    name: string
    location: string
}

interface CoachBatch {
    id: string
    name: string
    code: string | null
    description: string | null
    skillLevel: string
    ageGroup: string
    batchType: string
    academy: Academy
    currentEnrollment: number
    maxStudents: number
    utilizationPercentage: number
    daysOfWeek: string[]
    timeSlot: string
    startTime: string | null
    endTime: string | null
    sessionsPerWeek: number
    totalSessions: number
    completedSessions: number
    progressPercentage: number
    status: string
    monthlyFee: number
    stats?: BatchStats
    startDate: string | null
    endDate: string | null
    createdAt: string
}

interface Summary {
    totalBatches: number
    activeBatches: number
    totalStudents: number
    averageAttendance: number
    upcomingSessionsToday: number
}

interface CoachBatchesResponse {
    success: boolean
    data: {
        batches: CoachBatch[]
        summary: Summary
    }
    error?: {
        code: string
        message: string
    }
}

const fetcher = async (url: string): Promise<CoachBatchesResponse> => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch batches')
    }
    return res.json()
}

interface UseCoachBatchesOptions {
    includeStats?: boolean
    status?: string[]
}

export function useCoachBatches(options?: UseCoachBatchesOptions) {
    const params = new URLSearchParams()

    if (options?.includeStats) {
        params.append('includeStats', 'true')
    }
    if (options?.status && options.status.length > 0) {
        params.append('status', options.status.join(','))
    }

    const queryString = params.toString()
    const url = `/api/coach/batches${queryString ? `?${queryString}` : ''}`

    const { data, error, isLoading, mutate } = useSWR<CoachBatchesResponse>(
        url,
        fetcher,
        {
            refreshInterval: 60000, // Auto-refresh every minute
            revalidateOnFocus: true,
            dedupingInterval: 5000
        }
    )

    const defaultSummary: Summary = {
        totalBatches: 0,
        activeBatches: 0,
        totalStudents: 0,
        averageAttendance: 0,
        upcomingSessionsToday: 0
    }

    return {
        batches: data?.data?.batches || [],
        summary: data?.data?.summary || defaultSummary,
        isLoading,
        isError: !!error,
        error: error || data?.error,
        refresh: mutate
    }
}
