"use server"

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

interface AttendanceRecord {
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'LEAVE'
    arrivalTime?: string
    minutesLate?: number
    notes?: string
}

interface AttendanceRequest {
    batchId: string
    date: string  // "YYYY-MM-DD"
    records: AttendanceRecord[]
}

export async function POST(request: Request) {
    try {
        // 1. Authentication & Authorization
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'COACH') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Coach access required' } },
                { status: 403 }
            )
        }

        // 2. Get coach profile
        const coach = await prisma.coach.findUnique({
            where: { userId: session.user.id },
            select: { id: true, fullName: true }
        })

        if (!coach) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Coach profile not found' } },
                { status: 404 }
            )
        }

        // 3. Parse request body
        const body: AttendanceRequest = await request.json()
        const { batchId, date, records } = body

        if (!batchId || !date || !records || records.length === 0) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
                { status: 400 }
            )
        }

        // 4. Verify coach owns this batch
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
            select: {
                id: true,
                name: true,
                coachId: true,
                academyId: true
            }
        })

        if (!batch) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Batch not found' } },
                { status: 404 }
            )
        }

        if (batch.coachId !== coach.id) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this batch' } },
                { status: 403 }
            )
        }

        // 5. Parse date
        const attendanceDate = startOfDay(new Date(date))

        // 6. Process each attendance record
        const results = {
            marked: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            errors: [] as string[]
        }

        for (const record of records) {
            try {
                // Check if student exists and belongs to this batch
                const student = await prisma.student.findFirst({
                    where: {
                        id: record.studentId,
                        batchId: batchId
                    }
                })

                if (!student) {
                    results.errors.push(`Student ${record.studentId} not found in batch`)
                    continue
                }

                // Check if record exists (for edit tracking)
                const existingRecord = await prisma.attendance.findUnique({
                    where: {
                        studentId_date_batchId: {
                            studentId: record.studentId,
                            date: attendanceDate,
                            batchId: batchId
                        }
                    }
                })

                // Upsert attendance record
                await prisma.attendance.upsert({
                    where: {
                        studentId_date_batchId: {
                            studentId: record.studentId,
                            date: attendanceDate,
                            batchId: batchId
                        }
                    },
                    create: {
                        studentId: record.studentId,
                        batchId: batchId,
                        coachId: coach.id,
                        date: attendanceDate,
                        status: record.status,
                        arrivalTime: record.arrivalTime ? new Date(`${date}T${record.arrivalTime}`) : null,
                        minutesLate: record.minutesLate || null,
                        notes: record.notes || null,
                        markedAt: new Date(),
                        isExcused: record.status === 'EXCUSED' || record.status === 'LEAVE'
                    },
                    update: {
                        status: record.status,
                        arrivalTime: record.arrivalTime ? new Date(`${date}T${record.arrivalTime}`) : null,
                        minutesLate: record.minutesLate || null,
                        notes: record.notes || null,
                        lastEditedAt: existingRecord ? new Date() : null,
                        editCount: existingRecord ? { increment: 1 } : 0,
                        isExcused: record.status === 'EXCUSED' || record.status === 'LEAVE'
                    }
                })

                // Update student stats
                const isPresent = record.status === 'PRESENT' || record.status === 'LATE'

                // Get total attendance counts for this student
                const attendanceCounts = await prisma.attendance.groupBy({
                    by: ['status'],
                    where: { studentId: record.studentId },
                    _count: true
                })

                const totalPresent = attendanceCounts
                    .filter(c => c.status === 'PRESENT' || c.status === 'LATE')
                    .reduce((sum, c) => sum + c._count, 0)

                const totalAbsent = attendanceCounts
                    .filter(c => c.status === 'ABSENT')
                    .reduce((sum, c) => sum + c._count, 0)

                const totalLate = attendanceCounts
                    .filter(c => c.status === 'LATE')
                    .reduce((sum, c) => sum + c._count, 0)

                const total = attendanceCounts.reduce((sum, c) => sum + c._count, 0)
                const percentage = total > 0 ? Math.round((totalPresent / total) * 100) : 100

                // Calculate streak
                let currentStreak = 0
                if (isPresent) {
                    // Get recent attendance to calculate streak
                    const recentAttendance = await prisma.attendance.findMany({
                        where: { studentId: record.studentId },
                        orderBy: { date: 'desc' },
                        take: 30,
                        select: { status: true }
                    })

                    for (const att of recentAttendance) {
                        if (att.status === 'PRESENT' || att.status === 'LATE') {
                            currentStreak++
                        } else if (att.status === 'ABSENT') {
                            break
                        }
                    }
                }

                // Update student record
                await prisma.student.update({
                    where: { id: record.studentId },
                    data: {
                        attendancePercentage: percentage,
                        consecutivePresent: currentStreak,
                        longestStreak: {
                            set: Math.max(student.longestStreak || 0, currentStreak)
                        },
                        lastAttendanceDate: attendanceDate,
                        lastAttendanceStatus: record.status
                    }
                })

                // Count results
                results.marked++
                switch (record.status) {
                    case 'PRESENT': results.present++; break
                    case 'ABSENT': results.absent++; break
                    case 'LATE': results.late++; break
                    case 'EXCUSED':
                    case 'LEAVE': results.excused++; break
                }

            } catch (recordError) {
                console.error(`Error processing student ${record.studentId}:`, recordError)
                results.errors.push(`Failed to process student ${record.studentId}`)
            }
        }

        // Calculate attendance rate
        const attendanceRate = results.marked > 0
            ? Math.round(((results.present + results.late) / results.marked) * 100)
            : 0

        return NextResponse.json({
            success: true,
            data: {
                marked: results.marked,
                present: results.present,
                absent: results.absent,
                late: results.late,
                excused: results.excused,
                attendanceRate,
                errors: results.errors.length > 0 ? results.errors : undefined
            },
            message: `Attendance marked for ${results.marked} students`,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Coach Attendance POST Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to mark attendance' } },
            { status: 500 }
        )
    }
}

// GET: Fetch attendance for a batch on a date
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'COACH') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Coach access required' } },
                { status: 403 }
            )
        }

        const coach = await prisma.coach.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!coach) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Coach profile not found' } },
                { status: 404 }
            )
        }

        const { searchParams } = new URL(request.url)
        const batchId = searchParams.get('batchId')
        const date = searchParams.get('date')

        if (!batchId || !date) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_INPUT', message: 'batchId and date required' } },
                { status: 400 }
            )
        }

        // Verify coach owns batch
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
            select: { coachId: true }
        })

        if (!batch || batch.coachId !== coach.id) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
                { status: 403 }
            )
        }

        const attendanceDate = startOfDay(new Date(date))

        const records = await prisma.attendance.findMany({
            where: {
                batchId,
                date: attendanceDate
            },
            select: {
                id: true,
                studentId: true,
                status: true,
                arrivalTime: true,
                minutesLate: true,
                notes: true,
                markedAt: true,
                editCount: true
            }
        })

        // Create a map for quick lookup
        const attendanceMap: Record<string, {
            status: string
            arrivalTime: string | null
            minutesLate: number | null
            notes: string | null
            markedAt: string
            editCount: number
        }> = {}

        records.forEach(r => {
            attendanceMap[r.studentId] = {
                status: r.status,
                arrivalTime: r.arrivalTime?.toISOString() || null,
                minutesLate: r.minutesLate,
                notes: r.notes,
                markedAt: r.markedAt.toISOString(),
                editCount: r.editCount
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                date: attendanceDate.toISOString(),
                records: attendanceMap,
                totalMarked: records.length
            }
        })

    } catch (error) {
        console.error('[Coach Attendance GET Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch attendance' } },
            { status: 500 }
        )
    }
}
