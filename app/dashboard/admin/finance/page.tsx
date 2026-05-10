'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard'
import { RecentTransactionsTable } from '@/components/admin/RecentTransactionsTable'
import { RecordPaymentDialog } from '@/components/admin/RecordPaymentDialog'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { OverduePaymentsList } from '@/components/admin/OverduePaymentsList'
import { formatCurrency } from '@/lib/utils/currency'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorState } from '@/components/ui/error-state'

export default function FinancePage() {
    const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false)
    const { dashboard, isLoading, isError, refresh } = useFinanceDashboard()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (isError) {
        return <ErrorState message="Failed to load financial data" onRetry={refresh} />
    }

    const { summary, trends, recentTransactions, overduePayments, breakdown } = dashboard

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Track revenue, payments, and dues across all academies
                    </p>
                </div>
                <Button onClick={() => setIsRecordDialogOpen(true)} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Record Payment
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                        <div className="flex items-center mt-1">
                            {trends.revenueGrowth >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs ${trends.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {trends.revenueGrowth > 0 ? '+' : ''}{trends.revenueGrowth}%
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {formatCurrency(summary.totalPending)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Collection rate: {summary.collectionRate}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary.totalOverdue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {overduePayments.length} payments overdue
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.monthlyRecurring)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Expected monthly revenue
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentTransactionsTable
                            transactions={recentTransactions}
                            onRefresh={refresh}
                        />
                    </CardContent>
                </Card>

                {/* Overdue Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Overdue Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OverduePaymentsList payments={overduePayments} />
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            {breakdown && breakdown.byMonth && (
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={breakdown.byMonth} />
                    </CardContent>
                </Card>
            )}

            {/* Record Payment Dialog */}
            <RecordPaymentDialog
                open={isRecordDialogOpen}
                onClose={() => setIsRecordDialogOpen(false)}
                onSuccess={() => {
                    refresh()
                    setIsRecordDialogOpen(false)
                }}
            />
        </div>
    )
}
