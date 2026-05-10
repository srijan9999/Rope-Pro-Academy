import useSWR from 'swr'

interface StudentBasic {
    id: string
    studentId: string
    fullName: string
    photoUrl?: string | null
    // add other fields if needed
}

interface StudentsResponse {
    success: boolean
    data: StudentBasic[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useStudents(params?: { status?: string }) {
    const query = params?.status ? `?status=${params.status}` : ''
    const { data, error, isLoading } = useSWR<StudentsResponse>(
        `/api/admin/students${query}`,
        fetcher
    )

    return {
        students: data?.data || [],
        isLoading,
        isError: error
    }
}
