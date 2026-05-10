'use client'

import useSWR from 'swr'

interface Academy {
    id: string
    name: string
    location: string
    address: string | null
    description: string | null
    contactPhone: string | null
    contactEmail: string | null
    locationLat: number | null
    locationLng: number | null
    academyType: string
    status: string
    capacity: number
    headCoachId: string | null
    headCoach: {
        id: string
        fullName: string
        photoUrl: string | null
        primarySpecialization: string
    } | null
    _count: {
        students: number
        batches: number
    }
    utilization: number
    createdAt: string
    updatedAt: string
}

interface AcademyStats {
    totalAcademies: number
    activeAcademies: number
    totalCapacity: number
    totalStudents: number
    averageUtilization: number
}

interface AcademyListResponse {
    success: true
    data: {
        academies: Academy[]
        stats: AcademyStats
    }
}

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error?.message || 'Failed to fetch')
    }
    return res.json()
}

export function useAcademies(status?: string) {
    const queryParams = status ? `?status=${status}` : ''

    const { data, error, isLoading, mutate } = useSWR<AcademyListResponse, Error>(
        `/api/academies${queryParams}`,
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    )

    return {
        academies: data?.data?.academies ?? [],
        stats: data?.data?.stats,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        refresh: mutate,
    }
}

export type { Academy, AcademyStats }
