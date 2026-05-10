"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, TrendingUp, Clock, ChevronRight, Loader2 } from "lucide-react"
import { useCoachBatches } from "@/hooks/useCoachBatches"
import { ErrorState } from "@/components/ui/error-state"
import Link from "next/link"

export default function CoachDashboard() {
    const { batches, summary, isLoading, isError, refresh } = useCoachBatches({ includeStats: true })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-8">
                <ErrorState
                    title="Failed to Load Dashboard"
                    message="We couldn't fetch your dashboard data. Please try again."
                    onRetry={() => refresh()}
                />
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-8 max-w-7xl mx-auto px-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold uppercase">Coach Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                            {summary.totalStudents}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Across {summary.totalBatches} batches
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                            {summary.activeBatches}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Currently running
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                            {summary.averageAttendance}%
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            Overall rate
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                            {summary.upcomingSessionsToday}
                        </div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Scheduled today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* My Batches */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Batches</CardTitle>
                    <Link href="/dashboard/coach/schedule">
                        <Button variant="outline" size="sm" className="gap-1">
                            View All
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {batches.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No batches assigned yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {batches.slice(0, 5).map(batch => (
                                <div
                                    key={batch.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{batch.name}</h4>
                                            <Badge variant="outline">{batch.skillLevel}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {batch.academy.name} • {batch.timeSlot}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">
                                                {batch.currentEnrollment}/{batch.maxStudents}
                                            </span>
                                        </div>
                                        {batch.stats && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {batch.stats.averageAttendance}% attendance
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/dashboard/coach/schedule">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                            <Calendar className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold mb-1">Mark Attendance</h3>
                            <p className="text-sm text-muted-foreground">
                                Record today's class attendance
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/coach/students">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                            <Users className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold mb-1">My Students</h3>
                            <p className="text-sm text-muted-foreground">
                                View and manage student profiles
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/coach/profile">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                            <TrendingUp className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold mb-1">My Profile</h3>
                            <p className="text-sm text-muted-foreground">
                                Update your coach profile
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
