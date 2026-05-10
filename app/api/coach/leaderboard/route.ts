import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/coach/leaderboard - Get attendance leaderboard for a batch
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const batchId = searchParams.get('batchId')
        const period = searchParams.get('period') || new Date().toISOString().slice(0, 7) // YYYY-MM
        const limit = parseInt(searchParams.get('limit') || '10')

        if (!batchId) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Batch ID required' } },
                { status: 400 }
            )
        }

        // Get all students in the batch with their attendance stats
        const students = await prisma.student.findMany({
            where: { batchId },
            select: {
                id: true,
                fullName: true,
                photoUrl: true,
                attendancePercentage: true,
                consecutivePresent: true,
                longestStreak: true,
            }
        })

        // Get attendance counts for the period
        const periodStart = new Date(`${period}-01`)
        const periodEnd = new Date(periodStart)
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        const attendanceCounts = await prisma.attendance.groupBy({
            by: ['studentId', 'status'],
            where: {
                batchId,
                date: {
                    gte: periodStart,
                    lt: periodEnd
                }
            },
            _count: true
        })

        // Calculate points and ranking for each student
        const studentStats = students.map(student => {
            const studentAttendance = attendanceCounts.filter(a => a.studentId === student.id)

            const present = studentAttendance.find(a => a.status === 'PRESENT')?._count || 0
            const late = studentAttendance.find(a => a.status === 'LATE')?._count || 0
            const absent = studentAttendance.find(a => a.status === 'ABSENT')?._count || 0

            const total = present + late + absent
            const attendanceRate = total > 0 ? Math.round((present + late) / total * 100) : 0

            // Points: 10 per present, 5 per late, 0 per absent
            const totalPoints = (present * 10) + (late * 5)

            return {
                studentId: student.id,
                studentName: student.fullName,
                photoUrl: student.photoUrl,
                attendanceRate,
                streakDays: student.consecutivePresent || 0,
                longestStreak: student.longestStreak || 0,
                totalPoints,
                presentCount: present,
                lateCount: late,
                absentCount: absent
            }
        })

        // Sort by attendance rate, then points, then streak
        studentStats.sort((a, b) => {
            if (b.attendanceRate !== a.attendanceRate) return b.attendanceRate - a.attendanceRate
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
            return b.streakDays - a.streakDays
        })

        // Add rank
        const rankedEntries = studentStats.slice(0, limit).map((entry, index) => ({
            ...entry,
            rank: index + 1
        }))

        return NextResponse.json({
            success: true,
            data: {
                period,
                batchId,
                entries: rankedEntries,
                totalStudents: students.length
            }
        })

    } catch (error) {
        console.error('Leaderboard fetch error:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' } },
            { status: 500 }
        )
    }
}
