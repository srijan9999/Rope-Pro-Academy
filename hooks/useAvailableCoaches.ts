'use client'

import useSWR from 'swr'

interface AvailableCoach {
    id: string
    coachId: string
    fullName: string
    photoUrl: string | null
    specialization: string
    experienceYears: number
    coachingYears: number
    isHeadCoach: boolean
    currentAcademy: {
        id: string
        name: string
    } | null
    achievements: {
        guinnessRecords: number
        limcaRecords: number
        nationalMedals: number
    }
}

interface AvailableCoachesResponse {
    success: true
    data: {
        coaches: AvailableCoach[]
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

export function useAvailableCoaches(
    currentAcademyId?: string,
    excludeHeadCoaches: boolean = true
) {
    const params = new URLSearchParams()

    if (excludeHeadCoaches) {
        params.append('excludeHeadCoaches', 'true')
    }

    if (currentAcademyId) {
        params.append('academyId', currentAcademyId)
    }

    const { data, error, isLoading } = useSWR<AvailableCoachesResponse, Error>(
        `/api/coaches/available?${params.toString()}`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000
        }
    )

    return {
        coaches: data?.data?.coaches ?? [],
        isLoading,
        isError: !!error,
        errorMessage: error?.message
    }
}

export type { AvailableCoach }
