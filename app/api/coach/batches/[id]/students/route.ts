"use server"

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { differenceInYears } from 'date-fns'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: batchId } = await params

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
            select: { id: true }
        })

        if (!coach) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Coach profile not found' } },
                { status: 404 }
            )
        }

        // 3. Verify coach owns this batch
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
            include: {
                academy: {
                    select: { name: true, location: true }
                }
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

        // 4. Parse query parameters
        const { searchParams } = new URL(request.url)
        const sortBy = searchParams.get('sortBy') || 'name'
        const includeAttendance = searchParams.get('includeAttendance') === 'true'

        // 5. Build order clause
        let orderBy: Record<string, string> = { fullName: 'asc' }
        if (sortBy === 'attendance') {
            orderBy = { attendancePercentage: 'desc' }
        } else if (sortBy === 'performance') {
            orderBy = { lastAssessmentScore: 'desc' }
        }

        // 6. Fetch students
        const students = await prisma.student.findMany({
            where: {
                batchId: batch.id
            },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true
                    }
                }
            },
            orderBy
        })

        const now = new Date()

        // 7. Enrich student data
        const enrichedStudents = await Promise.all(students.map(async (student) => {
            // Get recent attendance if requested
            let recentAttendance: { date: string; status: string }[] = []
            if (includeAttendance) {
                const attendance = await prisma.attendance.findMany({
                    where: {
                        studentId: student.id
                    },
                    orderBy: { date: 'desc' },
                    take: 10,
                    select: {
                        date: true,
                        status: true
                    }
                })
                recentAttendance = attendance.map(a => ({
                    date: a.date.toISOString(),
                    status: a.status
                }))
            }

            // Get latest progress report
            const latestReport = await prisma.progressReport.findFirst({
                where: {
                    studentId: student.id,
                    status: 'PUBLISHED'
                },
                orderBy: { date: 'desc' },
                select: {
                    overallScore: true,
                    performanceGrade: true,
                    improvement: true
                }
            })

            // Calculate age
            const age = student.dateOfBirth
                ? differenceInYears(now, new Date(student.dateOfBirth))
                : null

            // Count attendance records
            const attendanceCounts = await prisma.attendance.groupBy({
                by: ['status'],
                where: {
                    studentId: student.id
                },
                _count: true
            })

            const totalPresent = attendanceCounts.find(r => r.status === 'PRESENT')?._count || 0
            const totalAbsent = attendanceCounts.find(r => r.status === 'ABSENT')?._count || 0

            // Check performance attention
            const needsAttention = (student.attendancePercentage || 100) < 75 ||
                (student.lastAssessmentScore !== null && student.lastAssessmentScore < 60)

            return {
                id: student.id,
                studentId: student.studentId,
                fullName: student.fullName,
                photoUrl: student.photoUrl,

                email: student.user.email,
                phone: student.phone,
                parentName: student.parentName,
                parentPhone: student.parentPhone,

                skillLevel: student.skillLevel,
                age,
                gender: student.gender,

                attendance: {
                    totalPresent,
                    totalAbsent,
                    percentage: Math.round(student.attendancePercentage || 100),
                    currentStreak: student.consecutivePresent || 0,
                    lastAttended: student.lastAttendanceDate?.toISOString() || null,
                    lastStatus: student.lastAttendanceStatus
                },

                performance: {
                    latestScore: latestReport?.overallScore || student.lastAssessmentScore || null,
                    latestGrade: latestReport?.performanceGrade || null,
                    improvement: latestReport?.improvement || null,
                    needsAttention
                },

                recentAttendance: includeAttendance ? recentAttendance : undefined,

                paymentStatus: {
                    lastPaymentDate: student.lastPaymentDate?.toISOString() || null,
                    pendingAmount: student.totalPending || 0,
                    isPaidThisMonth: (student.totalPending || 0) === 0
                },

                status: student.user.status,
                joinedDate: student.joiningDate.toISOString()
            }
        }))

        // 8. Calculate analytics
        const analytics = {
            totalStudents: enrichedStudents.length,
            averageAttendance: enrichedStudents.length > 0
                ? Math.round(
                    enrichedStudents.reduce((sum, s) => sum + s.attendance.percentage, 0) /
                    enrichedStudents.length
                )
                : 0,
            studentsOnTrack: enrichedStudents.filter(s => !s.performance.needsAttention).length,
            studentsNeedingAttention: enrichedStudents.filter(s => s.performance.needsAttention).length,
            attendanceDistribution: {
                excellent: enrichedStudents.filter(s => s.attendance.percentage > 90).length,
                good: enrichedStudents.filter(s => s.attendance.percentage >= 75 && s.attendance.percentage <= 90).length,
                average: enrichedStudents.filter(s => s.attendance.percentage >= 60 && s.attendance.percentage < 75).length,
                poor: enrichedStudents.filter(s => s.attendance.percentage < 60).length
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                batch: {
                    id: batch.id,
                    name: batch.name,
                    code: batch.code,
                    academy: batch.academy.name,
                    location: batch.academy.location,
                    currentEnrollment: batch.currentStrength,
                    skillLevel: batch.skillLevel,
                    timeSlot: batch.startTime && batch.endTime
                        ? `${batch.startTime} - ${batch.endTime}`
                        : 'Not scheduled'
                },
                students: enrichedStudents,
                analytics
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Batch Students Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch students' } },
            { status: 500 }
        )
    }
}
