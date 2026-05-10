"use server"

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

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
        const includeStats = searchParams.get('includeStats') === 'true'
        const statusFilter = searchParams.get('status')?.split(',')

        // 4. Build where clause - Coach only sees their batches
        const where: Record<string, unknown> = {
            coachId: coach.id,
        }
        if (statusFilter && statusFilter.length > 0) {
            where.status = { in: statusFilter }
        }

        // 5. Fetch batches
        const batches = await prisma.batch.findMany({
            where,
            include: {
                academy: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                },
                _count: {
                    select: {
                        students: true,
                        attendances: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { name: 'asc' }
            ]
        })

        // 6. Enrich batch data
        const enrichedBatches = await Promise.all(batches.map(async (batch) => {
            const utilizationPercentage = batch.maxCapacity > 0
                ? Math.round((batch.currentStrength / batch.maxCapacity) * 100)
                : 0

            const progressPercentage = batch.totalSessions && batch.totalSessions > 0
                ? Math.round((batch.completedSessions / batch.totalSessions) * 100)
                : 0

            // Format time slot
            const timeSlot = batch.startTime && batch.endTime
                ? `${batch.startTime} - ${batch.endTime}`
                : 'Not scheduled'

            // Parse days of week
            let daysOfWeek: string[] = []
            try {
                daysOfWeek = batch.daysOfWeek ? JSON.parse(batch.daysOfWeek) : []
            } catch {
                daysOfWeek = []
            }

            let stats = undefined

            // Fetch detailed stats if requested
            if (includeStats) {
                // Get attendance summary
                const attendanceStats = await prisma.attendance.groupBy({
                    by: ['status'],
                    where: {
                        batchId: batch.id
                    },
                    _count: true
                })

                // Calculate average attendance
                const totalRecords = attendanceStats.reduce((sum, s) => sum + s._count, 0)
                const presentCount = attendanceStats.find(s => s.status === 'PRESENT')?._count || 0
                const averageAttendance = totalRecords > 0
                    ? Math.round((presentCount / totalRecords) * 100)
                    : 0

                // Get students needing attention (low attendance)
                const studentsNeedingAttention = await prisma.student.count({
                    where: {
                        batchId: batch.id,
                        attendancePercentage: { lt: 75 }
                    }
                })

                stats = {
                    averageAttendance,
                    studentsOnTrack: batch.currentStrength - studentsNeedingAttention,
                    studentsNeedingAttention,
                    totalRecords
                }
            }

            return {
                id: batch.id,
                name: batch.name,
                code: batch.code,
                description: batch.description,

                skillLevel: batch.skillLevel,
                ageGroup: batch.ageGroup || 'MIXED',
                batchType: batch.batchType || 'REGULAR',

                academy: batch.academy,

                currentEnrollment: batch.currentStrength,
                maxStudents: batch.maxCapacity,
                utilizationPercentage,

                daysOfWeek,
                timeSlot,
                startTime: batch.startTime,
                endTime: batch.endTime,
                sessionsPerWeek: batch.sessionsPerWeek || 3,

                totalSessions: batch.totalSessions || 0,
                completedSessions: batch.completedSessions,
                progressPercentage,

                status: batch.status,
                monthlyFee: batch.monthlyFee,

                stats,

                startDate: batch.startDate?.toISOString(),
                endDate: batch.endDate?.toISOString(),

                createdAt: batch.createdAt.toISOString()
            }
        }))

        // 7. Calculate summary statistics
        const summary = {
            totalBatches: batches.length,
            activeBatches: batches.filter(b => b.status === 'ACTIVE').length,
            totalStudents: batches.reduce((sum, b) => sum + b.currentStrength, 0),
            averageAttendance: includeStats && enrichedBatches.length > 0
                ? Math.round(
                    enrichedBatches
                        .filter(b => b.stats)
                        .reduce((sum, b) => sum + (b.stats?.averageAttendance || 0), 0) /
                    Math.max(enrichedBatches.filter(b => b.stats).length, 1)
                )
                : 0,
            upcomingSessionsToday: 0 // TODO: Calculate based on schedule
        }

        return NextResponse.json({
            success: true,
            data: {
                batches: enrichedBatches,
                summary
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Coach Batches Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch batches' } },
            { status: 500 }
        )
    }
}
