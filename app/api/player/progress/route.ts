import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths } from 'date-fns'
import type { SkillLevel, ProgressResponse } from '@/types/api'

export async function GET(request: Request) {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        // 2. Parse query parameters
        const { searchParams } = new URL(request.url)
        const limit = Number(searchParams.get('limit')) || 10
        const includeHistory = searchParams.get('includeHistory') !== 'false'
        const includeTrends = searchParams.get('includeTrends') === 'true'

        // 3. Get student profile
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            select: { id: true, batchId: true }
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
                { status: 404 }
            )
        }

        // 4. Fetch progress reports
        const reports = await prisma.progressReport.findMany({
            where: {
                studentId: student.id,
                status: 'PUBLISHED'
            },
            include: {
                coach: {
                    select: {
                        id: true,
                        fullName: true,
                        photoUrl: true,
                        primarySpecialization: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: includeHistory ? limit : 1
        })

        // 5. Format current (latest) report
        const latestReport = reports[0]
        const currentReport = latestReport ? {
            id: latestReport.id,
            date: latestReport.date.toISOString(),
            assessmentType: latestReport.assessmentType,

            currentLevel: latestReport.currentLevel as SkillLevel,
            recommendedLevel: latestReport.recommendedLevel,

            metrics: {
                speed: latestReport.speed,
                endurance: Number(latestReport.endurance),
                freestyle: latestReport.freestyle,
                doubleUnders: latestReport.doubleUnders,
                crossovers: latestReport.crossovers,
                power: latestReport.power,
                coordination: latestReport.coordination,
                rhythm: latestReport.rhythm
            },

            proficiency: {
                speed: latestReport.speedScore,
                endurance: latestReport.enduranceScore,
                freestyle: latestReport.freestyleScore,
                doubleUnders: latestReport.doubleUndersScore,
                technique: latestReport.techniqueScore,
                overall: latestReport.overallScore
            },

            grade: latestReport.performanceGrade,
            feedback: latestReport.feedback,
            strengths: latestReport.strengths ? JSON.parse(latestReport.strengths) : [],
            improvements: latestReport.improvements ? JSON.parse(latestReport.improvements) : [],
            goals: latestReport.goals ? JSON.parse(latestReport.goals) : [],

            coach: {
                id: latestReport.coach.id,
                full_name: latestReport.coach.fullName,
                photo_url: latestReport.coach.photoUrl,
                specialization: latestReport.coach.primarySpecialization
            },

            batchAverage: latestReport.batchAverage,
            improvement: latestReport.improvement,

            videoUrl: latestReport.videoUrl,
            attachments: latestReport.attachments ? JSON.parse(latestReport.attachments) : []
        } : null

        // 6. Format history
        const history = reports.slice(1).map(report => ({
            id: report.id,
            date: report.date.toISOString(),
            assessmentType: report.assessmentType,
            overallScore: report.overallScore,
            grade: report.performanceGrade,
            coach: {
                id: report.coach.id,
                full_name: report.coach.fullName,
                photo_url: report.coach.photoUrl
            },
            feedback: report.feedback,
            improvement: report.improvement
        }))

        // 7. Calculate trends (if requested)
        let trends = null
        if (includeTrends && reports.length >= 3) {
            const threeMonthsAgo = subMonths(new Date(), 3)
            const recentReports = reports.filter(r => new Date(r.date) >= threeMonthsAgo)

            if (recentReports.length >= 2) {
                const oldest = recentReports[recentReports.length - 1]
                const newest = recentReports[0]

                const calculateTrend = (oldVal: number, newVal: number) => {
                    const change = oldVal === 0 ? 0 : ((newVal - oldVal) / oldVal) * 100
                    return {
                        trend: (change > 5 ? 'IMPROVING' : change < -5 ? 'DECLINING' : 'STABLE') as 'IMPROVING' | 'STABLE' | 'DECLINING',
                        change: Math.round(change)
                    }
                }

                trends = {
                    period: 'Last 3 months',
                    overall: {
                        improvement: newest.overallScore - oldest.overallScore,
                        consistency: Math.round(
                            recentReports.reduce((sum, r) => sum + r.overallScore, 0) / recentReports.length
                        ),
                        direction: (newest.overallScore > oldest.overallScore ? 'IMPROVING' :
                            newest.overallScore < oldest.overallScore ? 'DECLINING' : 'STABLE') as 'IMPROVING' | 'STABLE' | 'DECLINING'
                    },
                    bySkill: {
                        speed: calculateTrend(oldest.speedScore, newest.speedScore),
                        endurance: calculateTrend(oldest.enduranceScore, newest.enduranceScore),
                        freestyle: calculateTrend(oldest.freestyleScore, newest.freestyleScore),
                        doubleUnders: calculateTrend(oldest.doubleUndersScore, newest.doubleUndersScore)
                    }
                }
            }
        }

        // 8. Fetch milestones
        const [achievedMilestones, upcomingMilestones] = await Promise.all([
            prisma.skillMilestone.findMany({
                where: {
                    studentId: student.id,
                    isAchieved: true
                },
                orderBy: {
                    achievedDate: 'desc'
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    achievedDate: true,
                    badge: true,
                    points: true
                }
            }),

            prisma.skillMilestone.findMany({
                where: {
                    studentId: student.id,
                    isAchieved: false
                },
                orderBy: {
                    targetValue: 'asc'
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    targetValue: true,
                    achievedValue: true,
                    unit: true
                }
            })
        ])

        const milestones = {
            achieved: achievedMilestones.map(m => ({
                id: m.id,
                title: m.title,
                achievedDate: m.achievedDate?.toISOString() || '',
                badge: m.badge,
                points: m.points
            })),
            upcoming: upcomingMilestones.map(m => ({
                id: m.id,
                title: m.title,
                progress: m.targetValue === 0 ? 0 : Math.round((m.achievedValue / m.targetValue) * 100),
                targetValue: m.targetValue,
                currentValue: m.achievedValue
            }))
        }

        // 9. Calculate statistics
        const stats = {
            totalReports: reports.length,
            averageScore: reports.length > 0
                ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)
                : 0,
            highestScore: reports.length > 0
                ? Math.max(...reports.map(r => r.overallScore))
                : 0,
            lowestScore: reports.length > 0
                ? Math.min(...reports.map(r => r.overallScore))
                : 0,
            recentImprovement: reports.length >= 3
                ? Math.round(
                    ((reports[0].overallScore + reports[1].overallScore + reports[2].overallScore) / 3) -
                    ((reports[3]?.overallScore || reports[0].overallScore) +
                        (reports[4]?.overallScore || reports[1].overallScore) +
                        (reports[5]?.overallScore || reports[2].overallScore)) / 3
                )
                : 0
        }

        const response: ProgressResponse = {
            success: true,
            data: {
                currentReport,
                history,
                trends,
                milestones,
                stats
            },
            timestamp: new Date().toISOString()
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('[Player Progress Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch progress data' } },
            { status: 500 }
        )
    }
}
