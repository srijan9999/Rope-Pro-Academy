import useSWR from 'swr'

// Fetcher function
const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useAttendance(month?: string) {
    const currentMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data, error, isLoading, mutate } = useSWR(
        `/api/player/attendance?month=${currentMonth}`,
        fetcher,
        {
            revalidateOnFocus: true,
            refreshInterval: 60000 // Refresh every minute
        }
    )

    return {
        attendance: data?.data?.attendance ?? [],
        stats: data?.data?.stats ?? {
            total: 0,
            present: 0,
            absent: 0,
            leave: 0
        },
        isLoading,
        isError: error || (data && !data.success),
        refresh: mutate
    }
}
