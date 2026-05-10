"use server"

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { differenceInYears, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: Request) {
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

        // 3. Parse query parameters
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const batchId = searchParams.get('batchId')
        const level = searchParams.get('level')

        // 4. Find all batches assigned to this coach
        const coachBatches = await prisma.batch.findMany({
            where: {
                coachId: coach.id,
                status: 'ACTIVE'
            },
            select: { id: true, name: true }
        })

        // If no batches assigned, return empty with flag
        if (coachBatches.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    batches: [],
                    noBatchesAssigned: true,
                    summary: {
                        totalStudents: 0,
                        averageAttendance: 0,
                        levelDistribution: {}
                    }
                },
                timestamp: new Date().toISOString()
            })
        }

        // 5. Build student query
        const batchIds = batchId
            ? [batchId]
            : coachBatches.map(b => b.id)

        const whereClause: Record<string, unknown> = {
            batchId: { in: batchIds }
        }

        // Search filter
        if (search) {
            whereClause.OR = [
                { fullName: { contains: search } },
                { studentId: { contains: search } }
            ]
        }

        // Level filter
        if (level) {
            whereClause.skillLevel = level
        }

        // 6. Fetch students
        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        email: true,
                        status: true
                    }
                },
                batch: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { fullName: 'asc' }
        })

        // 7. Calculate attendance for current month
        const now = new Date()
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        const enrichedStudents = await Promise.all(students.map(async (student) => {
            // Get attendance for current month
            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    studentId: student.id,
                    date: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                },
                select: {
                    status: true
                }
            })

            const totalClasses = attendanceRecords.length
            const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length
            const monthlyAttendance = totalClasses > 0
                ? Math.round((presentCount / totalClasses) * 100)
                : null // null means no classes yet this month

            // Calculate age
            const age = student.dateOfBirth
                ? differenceInYears(now, new Date(student.dateOfBirth))
                : null

            // Format skill level for display
            const levelDisplay = student.skillLevel
                ? student.skillLevel.charAt(0) + student.skillLevel.slice(1).toLowerCase()
                : 'Beginner'

            return {
                id: student.id,
                studentId: student.studentId,
                name: student.fullName,
                photoUrl: student.photoUrl,
                email: student.user.email,
                phone: student.phone,
                age,
                level: levelDisplay,
                skillLevel: student.skillLevel,
                batch: student.batch ? {
                    id: student.batch.id,
                    name: student.batch.name
                } : null,
                attendance: {
                    percentage: monthlyAttendance ?? student.attendancePercentage ?? 100,
                    monthlyPresent: presentCount,
                    monthlyTotal: totalClasses,
                    overallPercentage: Math.round(student.attendancePercentage || 100),
                    currentStreak: student.consecutivePresent || 0
                },
                status: student.user.status,
                joinedDate: student.joiningDate?.toISOString()
            }
        }))

        // 8. Calculate summary stats
        const levelDistribution: Record<string, number> = {}
        enrichedStudents.forEach(s => {
            levelDistribution[s.level] = (levelDistribution[s.level] || 0) + 1
        })

        const averageAttendance = enrichedStudents.length > 0
            ? Math.round(
                enrichedStudents.reduce((sum, s) => sum + s.attendance.percentage, 0) /
                enrichedStudents.length
            )
            : 0

        return NextResponse.json({
            success: true,
            data: {
                students: enrichedStudents,
                batches: coachBatches,
                noBatchesAssigned: false,
                summary: {
                    totalStudents: enrichedStudents.length,
                    averageAttendance,
                    levelDistribution
                }
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Coach Students Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch students' } },
            { status: 500 }
        )
    }
}
