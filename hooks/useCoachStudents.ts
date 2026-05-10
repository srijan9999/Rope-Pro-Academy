import useSWR from 'swr'

interface StudentBatch {
    id: string
    name: string
}

interface StudentAttendance {
    percentage: number
    monthlyPresent: number
    monthlyTotal: number
    overallPercentage: number
    currentStreak: number
}

export interface CoachStudent {
    id: string
    studentId: string
    name: string
    photoUrl: string | null
    email: string
    phone: string | null
    age: number | null
    level: string
    skillLevel: string | null
    batch: StudentBatch | null
    attendance: StudentAttendance
    status: string
    joinedDate: string | null
}

interface Summary {
    totalStudents: number
    averageAttendance: number
    levelDistribution: Record<string, number>
}

interface CoachStudentsResponse {
    success: boolean
    data: {
        students: CoachStudent[]
        batches: StudentBatch[]
        noBatchesAssigned: boolean
        summary: Summary
    }
    error?: {
        code: string
        message: string
    }
}

const fetcher = async (url: string): Promise<CoachStudentsResponse> => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch students')
    }
    return res.json()
}

interface UseCoachStudentsOptions {
    search?: string
    batchId?: string
    level?: string
}

export function useCoachStudents(options?: UseCoachStudentsOptions) {
    const params = new URLSearchParams()

    if (options?.search) {
        params.append('search', options.search)
    }
    if (options?.batchId) {
        params.append('batchId', options.batchId)
    }
    if (options?.level) {
        params.append('level', options.level)
    }

    const queryString = params.toString()
    const url = `/api/coach/students${queryString ? `?${queryString}` : ''}`

    const { data, error, isLoading, mutate } = useSWR<CoachStudentsResponse>(
        url,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000
        }
    )

    const defaultSummary: Summary = {
        totalStudents: 0,
        averageAttendance: 0,
        levelDistribution: {}
    }

    return {
        students: data?.data?.students || [],
        batches: data?.data?.batches || [],
        noBatchesAssigned: data?.data?.noBatchesAssigned || false,
        summary: data?.data?.summary || defaultSummary,
        isLoading,
        isError: !!error,
        error: error || data?.error,
        refresh: mutate
    }
}
