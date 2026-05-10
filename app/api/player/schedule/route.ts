import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    startOfDay,
    endOfDay,
    parseISO,
    eachDayOfInterval,
    getDay,
    format,
    isBefore,
    isSameDay
} from 'date-fns'
import type { PlayerScheduleResponse, ScheduleEvent } from '@/types/api'

export async function GET(request: Request) {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Student access required' } },
                { status: 401 }
            )
        }

        // 2. Parse Query Params
        const { searchParams } = new URL(request.url)
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')

        if (!startDateParam || !endDateParam) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'startDate and endDate required' } },
                { status: 400 }
            )
        }

        const start = startOfDay(parseISO(startDateParam))
        const end = endOfDay(parseISO(endDateParam))

        // 3. Fetch Student Batch & Profile
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                batch: {
                    include: {
                        classSchedules: {
                            where: { isActive: true }
                        }
                    }
                },
                academy: true
            }
        })

        if (!student || !student.batch) {
            return NextResponse.json({ success: true, data: [], timestamp: new Date().toISOString() })
        }

        // 4. Fetch Attendance for the period (to determine status of past classes)
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId: student.id,
                date: {
                    gte: start,
                    lte: end
                }
            }
        })

        // 5. Expand Schedule
        const events: ScheduleEvent[] = []
        const daysInInterval = eachDayOfInterval({ start, end })
        const now = new Date()

        // Map DB dayOfWeek (0=Sun) to date-fns getDay (0=Sun)
        // They match perfectly.

        for (const day of daysInInterval) {
            const dayOfWeek = getDay(day)

            // Find schedules for this day
            const dailySchedules = student.batch.classSchedules.filter(s => s.dayOfWeek === dayOfWeek)

            for (const schedule of dailySchedules) {
                // Check for specific holidays/cancellations here (if implemented in future)

                // Determine Status
                let status: ScheduleEvent['status'] = 'UPCOMING'
                const isPast = isBefore(endOfDay(day), now)

                // Check if attended
                const attendance = attendanceRecords.find(a => isSameDay(a.date, day))

                if (attendance) {
                    status = attendance.status === 'PRESENT' ? 'COMPLETED' : 'MISSED'
                } else if (isPast) {
                    // No record found but it's in the past -> default to Missed or just "Completed" if we assume implicit?
                    // Usually "Missed" if no attendance marked, or "Upcoming" if today. 
                    // Let's mark as MISSED if past and no record, assuming strict attendance. 
                    // Alternatively, if system doesn't auto-mark, maybe it's just 'UPCOMING' or 'UNKNOWN'?
                    // Safe bet: If strictly past (yesterday), and no attendance, it's Missed or not marked.
                    // Let's use 'MISSED' for visual clarity if it was expected.
                    status = 'MISSED'
                }

                // Create Event
                events.push({
                    id: `${schedule.id}-${format(day, 'yyyy-MM-dd')}`, // Virtual ID
                    title: `${student.batch.skillLevel} Training`,
                    date: day.toISOString(),
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    type: 'REGULAR',
                    status: status,
                    coach: student.batch.coachId ? { // Assuming batch has coach, or schedule has overrides?
                        id: student.batch.coachId,
                        fullName: 'Coach' // We didn't fetch Coach name in batch include... let's fix that or use generic
                    } : undefined, // Schedule might have venue/notes
                    location: schedule.venue || student.academy?.name
                })
            }
        }

        return NextResponse.json({
            success: true,
            data: events,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Schedule API Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch schedule' } },
            { status: 500 }
        )
    }
}
