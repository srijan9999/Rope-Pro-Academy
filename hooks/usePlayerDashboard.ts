import useSWR from 'swr'
import type { PlayerDashboardResponse } from '@/types/api'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePlayerDashboard(month?: string) {
    const queryParam = month ? `?month=${month}` : ''

    const { data, error, isLoading, mutate } = useSWR<PlayerDashboardResponse>(
        `/api/player/dashboard${queryParam}`,
        fetcher,
        {
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000
        }
    )

    return {
        dashboard: data?.data || getEmptyDashboard(),
        isLoading,
        isError: error,
        refresh: mutate
    }
}

function getEmptyDashboard() {
    return {
        student: {
            id: '',
            student_id: '',
            full_name: 'Student',
            skill_level: 'BEGINNER' as const,
            joining_date: new Date().toISOString(),
            total_medals: 0,
            academy: { id: '', name: '', location: '' },
            batch: {
                id: '',
                name: '',
                time_slot_start: '',
                time_slot_end: '',
                days_of_week: []
            },
            coach: { id: '', full_name: '', specialization: '' }
        },
        attendance: {
            thisMonth: { present: 0, absent: 0, leave: 0, total: 0, percentage: 0 },
            lastMonth: { present: 0, total: 0, percentage: 0 },
            trend: { change: 0, improving: true },
            streaks: { current: 0, longest: 0 }
        },
        nextClass: null,
        upcomingClasses: [],
        skillProgress: {
            currentLevel: 'BEGINNER' as const,
            progressToNext: 0,
            nextLevel: null,
            nextAssessment: null,
            metrics: {
                speed: { current: 0, target: 100, percentage: 0 },
                endurance: { current: 0, target: 5, percentage: 0 },
                freestyle: { current: 0, target: 5, percentage: 0 },
                doubleUnders: { current: 0, target: 30, percentage: 0 }
            }
        },
        recentAchievements: [],
        coachFeedback: { latest: null, count: 0 }
    }
}
