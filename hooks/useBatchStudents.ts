import useSWR from 'swr'

interface AttendanceInfo {
    totalPresent: number
    totalAbsent: number
    percentage: number
    currentStreak: number
    lastAttended: string | null
    lastStatus: string | null
}

interface PerformanceInfo {
    latestScore: number | null
    latestGrade: string | null
    improvement: number | null
    needsAttention: boolean
}

interface PaymentStatus {
    lastPaymentDate: string | null
    pendingAmount: number
    isPaidThisMonth: boolean
}

interface RecentAttendance {
    date: string
    status: string
}

export interface BatchStudent {
    id: string
    studentId: string
    fullName: string
    photoUrl: string | null
    email: string
    phone: string | null
    parentName: string | null
    parentPhone: string | null
    skillLevel: string
    age: number | null
    gender: string | null
    attendance: AttendanceInfo
    performance: PerformanceInfo
    recentAttendance?: RecentAttendance[]
    paymentStatus: PaymentStatus
    status: string
    joinedDate: string
}

interface BatchInfo {
    id: string
    name: string
    code: string | null
    academy: string
    location: string
    currentEnrollment: number
    skillLevel: string
    timeSlot: string
}

interface BatchAnalytics {
    totalStudents: number
    averageAttendance: number
    studentsOnTrack: number
    studentsNeedingAttention: number
    attendanceDistribution: {
        excellent: number
        good: number
        average: number
        poor: number
    }
}

interface BatchStudentsResponse {
    success: boolean
    data: {
        batch: BatchInfo
        students: BatchStudent[]
        analytics: BatchAnalytics
    }
    error?: {
        code: string
        message: string
    }
}

const fetcher = async (url: string): Promise<BatchStudentsResponse> => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch students')
    }
    return res.json()
}

interface UseBatchStudentsOptions {
    sortBy?: 'name' | 'attendance' | 'performance'
    includeAttendance?: boolean
}

export function useBatchStudents(batchId: string | null, options?: UseBatchStudentsOptions) {
    const params = new URLSearchParams()

    if (options?.sortBy) {
        params.append('sortBy', options.sortBy)
    }
    if (options?.includeAttendance) {
        params.append('includeAttendance', 'true')
    }

    const queryString = params.toString()
    const url = batchId
        ? `/api/coach/batches/${batchId}/students${queryString ? `?${queryString}` : ''}`
        : null

    const { data, error, isLoading, mutate } = useSWR<BatchStudentsResponse>(
        url,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000
        }
    )

    const defaultAnalytics: BatchAnalytics = {
        totalStudents: 0,
        averageAttendance: 0,
        studentsOnTrack: 0,
        studentsNeedingAttention: 0,
        attendanceDistribution: {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0
        }
    }

    return {
        students: data?.data?.students || [],
        batch: data?.data?.batch || null,
        analytics: data?.data?.analytics || defaultAnalytics,
        isLoading,
        isError: !!error,
        error: error || data?.error,
        refresh: mutate
    }
}
