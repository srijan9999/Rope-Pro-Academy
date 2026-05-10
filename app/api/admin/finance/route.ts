import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns'

export async function GET(request: Request) {
    try {
        // 1. Authentication & Authorization
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        // 2. Parse query parameters
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'month'
        const academyId = searchParams.get('academyId')
        const includeBreakdown = searchParams.get('includeBreakdown') === 'true'

        // 3. Determine date range based on period
        let startDate: Date, endDate: Date

        switch (period) {
            case 'month':
                startDate = startOfMonth(new Date())
                endDate = endOfMonth(new Date())
                break
            case 'quarter':
                const currentMonth = new Date().getMonth()
                const quarterStart = Math.floor(currentMonth / 3) * 3
                startDate = new Date(new Date().getFullYear(), quarterStart, 1)
                endDate = new Date(new Date().getFullYear(), quarterStart + 3, 0)
                break
            case 'year':
                startDate = new Date(new Date().getFullYear(), 0, 1)
                endDate = new Date(new Date().getFullYear(), 11, 31)
                break
            case 'custom':
                startDate = new Date(searchParams.get('startDate') || new Date())
                endDate = new Date(searchParams.get('endDate') || new Date())
                break
            default:
                startDate = startOfMonth(new Date())
                endDate = endOfMonth(new Date())
        }

        // 4. Build base where clause
        const baseWhere: Prisma.PaymentWhereInput = {
            AND: [
                academyId ? { academyId } : {},
                {
                    OR: [
                        { paymentDate: { gte: startDate, lte: endDate } },
                        { dueDate: { gte: startDate, lte: endDate } }
                    ]
                }
            ] as const
        }

        // 5. Fetch summary statistics using aggregations
        const [
            totalRevenueStat,
            totalPendingStat,
            totalOverdueStat,
            paymentCounts
        ] = await Promise.all([
            prisma.payment.aggregate({
                where: {
                    ...baseWhere,
                    status: 'PAID'
                },
                _sum: {
                    netAmount: true
                },
                _avg: {
                    netAmount: true
                }
            }),

            prisma.payment.aggregate({
                where: {
                    ...baseWhere,
                    status: 'PENDING'
                },
                _sum: {
                    netAmount: true
                }
            }),

            prisma.payment.aggregate({
                where: {
                    ...baseWhere,
                    status: 'OVERDUE'
                },
                _sum: {
                    netAmount: true
                }
            }),

            prisma.payment.groupBy({
                by: ['status'],
                where: baseWhere,
                _sum: {
                    netAmount: true
                },
                _count: true
            })
        ])

        const totalRevenue = totalRevenueStat._sum.netAmount || 0
        const totalPending = totalPendingStat._sum.netAmount || 0
        const totalOverdue = totalOverdueStat._sum.netAmount || 0
        const averageTransactionValue = totalRevenueStat._avg.netAmount || 0

        const collectionRate = totalRevenue + totalPending > 0
            ? (totalRevenue / (totalRevenue + totalPending)) * 100
            : 0

        // 6. Calculate monthly recurring revenue
        const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        const monthlyRecurring = await prisma.payment.aggregate({
            where: {
                paymentType: 'MONTHLY_FEE',
                status: 'PAID',
                monthYear: currentMonthStr
            },
            _sum: {
                netAmount: true
            }
        })

        // 7. Fetch breakdown data (if requested)
        let breakdown: any = null

        if (includeBreakdown) {
            const [byType, byAcademy] = await Promise.all([
                // Breakdown by payment type
                prisma.payment.groupBy({
                    by: ['paymentType'],
                    where: {
                        ...baseWhere,
                        status: 'PAID'
                    },
                    _sum: {
                        netAmount: true
                    },
                    _count: true
                }),

                // Breakdown by academy
                prisma.payment.groupBy({
                    by: ['academyId'],
                    where: {
                        ...baseWhere,
                        status: 'PAID'
                    },
                    _sum: {
                        netAmount: true
                    },
                    _count: true
                })
            ])

            // Monthly trend (last 12 months) - manual grouping for SQLite support
            // Since SQLite doesn't strictly support date truncation in groupBy easily via Prisma
            // We will fetch raw data and aggregate in JS for simplicity or use raw query if needed.
            // For standard Prisma with SQLite, raw query is best for date manipulation or JS aggregation.
            // Let's use JS aggregation for safety and portability for now.

            const last12MonthsStart = subMonths(new Date(), 12)
            const monthlyData = await prisma.payment.findMany({
                where: {
                    status: 'PAID',
                    paymentDate: {
                        gte: last12MonthsStart
                    },
                    ...(academyId ? { academyId } : {})
                },
                select: {
                    paymentDate: true,
                    netAmount: true
                }
            })

            const monthlyMap = new Map<string, { revenue: number, payments: number }>()

            monthlyData.forEach(p => {
                if (!p.paymentDate) return
                const monthKey = p.paymentDate.toISOString().slice(0, 7) // YYYY-MM
                const current = monthlyMap.get(monthKey) || { revenue: 0, payments: 0 }

                monthlyMap.set(monthKey, {
                    revenue: current.revenue + p.netAmount,
                    payments: current.payments + 1
                })
            })

            const byMonth = Array.from(monthlyMap.entries())
                .map(([month, data]) => ({ month, ...data }))
                .sort((a, b) => a.month.localeCompare(b.month))


            // Enrich academy data with names
            const academyIds = byAcademy.map(a => a.academyId)
            const academies = await prisma.academy.findMany({
                where: { id: { in: academyIds } },
                select: { id: true, name: true }
            })

            const academyMap = new Map(academies.map(a => [a.id, a.name]))

            breakdown = {
                byType: byType.map(item => ({
                    type: item.paymentType,
                    amount: item._sum.netAmount || 0,
                    count: item._count,
                    percentage: totalRevenue > 0
                        ? ((item._sum.netAmount || 0) / totalRevenue) * 100
                        : 0
                })),

                byAcademy: byAcademy.map(item => ({
                    academyId: item.academyId,
                    academyName: academyMap.get(item.academyId) || 'Unknown',
                    revenue: item._sum.netAmount || 0,
                    count: item._count,
                    percentage: totalRevenue > 0
                        ? ((item._sum.netAmount || 0) / totalRevenue) * 100
                        : 0
                })),

                byMonth,

                byStatus: paymentCounts.reduce((acc, item) => {
                    acc[item.status.toLowerCase()] = item._sum.netAmount || 0
                    return acc
                }, {} as Record<string, number>)
            }
        }

        // 8. Fetch recent transactions (last 10)
        const recentTransactions = await prisma.payment.findMany({
            where: baseWhere,
            include: {
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        fullName: true,
                        photoUrl: true
                    }
                },
                academy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        })

        // 9. Calculate days overdue for each transaction
        const now = new Date()
        const enrichedTransactions = recentTransactions.map(payment => ({
            ...payment,
            daysOverdue: payment.status === 'OVERDUE'
                ? differenceInDays(now, new Date(payment.dueDate))
                : undefined
        }))

        // 10. Fetch upcoming dues (next 7 days)
        const upcomingDues = await prisma.payment.findMany({
            where: {
                status: 'PENDING',
                dueDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            },
            take: 20
        })

        const enrichedUpcoming = upcomingDues.map(payment => ({
            studentId: payment.student.id,
            studentName: payment.student.fullName,
            amount: payment.netAmount,
            dueDate: payment.dueDate.toISOString(),
            daysUntilDue: differenceInDays(new Date(payment.dueDate), now)
        }))

        // 11. Fetch overdue payments
        const overduePayments = await prisma.payment.findMany({
            where: {
                status: 'OVERDUE'
            },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                reminders: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            },
            take: 20
        })

        const enrichedOverdue = overduePayments.map(payment => ({
            id: payment.id,
            student: payment.student,
            amount: payment.netAmount,
            dueDate: payment.dueDate.toISOString(),
            daysOverdue: differenceInDays(now, new Date(payment.dueDate)),
            remindersSent: payment.reminders.length
        }))

        // 12. Calculate trends
        const lastPeriodRevenue = await prisma.payment.aggregate({
            where: {
                status: 'PAID',
                paymentDate: {
                    gte: subMonths(startDate, 1),
                    lt: startDate
                }
            },
            _sum: {
                netAmount: true
            }
        })

        const lastPeriodAmount = lastPeriodRevenue._sum.netAmount || 0
        const revenueGrowth = lastPeriodAmount > 0
            ? ((totalRevenue - lastPeriodAmount) / lastPeriodAmount) * 100
            : 0

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalPending,
                    totalOverdue,
                    netRevenue: totalRevenue,
                    monthlyRecurring: monthlyRecurring._sum.netAmount || 0,
                    collectionRate: Math.round(collectionRate * 10) / 10,
                    averageTransactionValue: Math.round(averageTransactionValue)
                },
                breakdown,
                trends: {
                    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                    overdueRate: totalRevenue + totalPending > 0
                        ? Math.round((totalOverdue / (totalRevenue + totalPending)) * 1000) / 10
                        : 0
                },
                recentTransactions: enrichedTransactions,
                upcomingDues: enrichedUpcoming,
                overduePayments: enrichedOverdue
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Finance Dashboard Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch financial data' } },
            { status: 500 }
        )
    }
}
