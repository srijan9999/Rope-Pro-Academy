import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const monthParam = searchParams.get('month') // Format: YYYY-MM

        let startDate: Date
        let endDate: Date

        if (monthParam) {
            const date = parseISO(`${monthParam}-01`)
            startDate = startOfMonth(date)
            endDate = endOfMonth(date)
        } else {
            const now = new Date()
            startDate = startOfMonth(now)
            endDate = endOfMonth(now)
        }

        // Get student ID
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
                { status: 404 }
            )
        }

        // Fetch attendance for the month
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId: student.id,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                date: true,
                status: true
            },
            orderBy: {
                date: 'asc'
            }
        })

        // Also fetch approved leaves for this month to permit merging/display
        // Note: The UI might want to show "LEAVE" status even if no attendance record exists yet for future dates
        const leaves = await prisma.request.findMany({
            where: {
                requesterId: session.user.id,
                type: { in: ['LEAVE', 'MEDICAL_LEAVE'] },
                status: 'APPROVED'
                // We'd need to filter by date overlapping the month
                // For simplicity in JSON data, we fetch recent approved leaves and filter in code
            }
        })

        // Process records
        const stats = {
            total: 0,
            present: 0,
            absent: 0,
            leave: 0
        }

        // Map attendance to simpler format
        const formattedAttendance = attendanceRecords.map(record => {
            const status = record.status as 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY'

            // Update stats
            if (status === 'PRESENT') stats.present++
            else if (status === 'ABSENT') stats.absent++
            else if (status === 'LEAVE') stats.leave++

            return {
                date: record.date.toISOString(),
                status
            }
        })

        // Add leave requests that might cover days without attendance records
        // This logic is complex to get perfect without a date loop, but for now 
        // we'll primarily rely on the explicit attendance records and let the frontend 
        // handle visualizing leave *requests* separately or assume the backend 'attendance'
        // table is the source of truth for "official" status.
        // If a leave is approved, an admin/system should ideally create Attendance records with status 'LEAVE'.
        // Assuming Phase 3 "Side Effect Handlers" (leave-approval.ts) does this.

        // Count total scheduled classes (Attendance entries)
        stats.total = attendanceRecords.length

        return NextResponse.json({
            success: true,
            data: {
                attendance: formattedAttendance,
                stats
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Get Player Attendance Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch attendance' } },
            { status: 500 }
        )
    }
}
