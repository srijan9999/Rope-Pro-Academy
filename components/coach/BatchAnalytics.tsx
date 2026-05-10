'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface BatchAnalyticsProps {
    analytics: {
        totalStudents: number
        averageAttendance: number
        studentsOnTrack: number
        studentsNeedingAttention: number
        attendanceDistribution: {
            excellent: number
            good: number
            average: number
            poor: number
        }
    }
}

export function BatchAnalytics({ analytics }: BatchAnalyticsProps) {
    const total = analytics.totalStudents || 1 // Prevent division by zero

    const excellentPercent = Math.round((analytics.attendanceDistribution.excellent / total) * 100)
    const goodPercent = Math.round((analytics.attendanceDistribution.good / total) * 100)
    const averagePercent = Math.round((analytics.attendanceDistribution.average / total) * 100)
    const poorPercent = Math.round((analytics.attendanceDistribution.poor / total) * 100)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Students */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                        {analytics.totalStudents}
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Enrolled in batch
                    </p>
                </CardContent>
            </Card>

            {/* Average Attendance */}
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                        {analytics.averageAttendance}%
                    </div>
                    <Progress
                        value={analytics.averageAttendance}
                        className="h-2 mt-2"
                    />
                </CardContent>
            </Card>

            {/* Students On Track */}
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">On Track</CardTitle>
                    <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                        {analytics.studentsOnTrack}
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                        Performing well
                    </p>
                </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                        {analytics.studentsNeedingAttention}
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                        Below 75% attendance
                    </p>
                </CardContent>
            </Card>

            {/* Attendance Distribution */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden">
                        {excellentPercent > 0 && (
                            <div
                                className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all"
                                style={{ width: `${excellentPercent}%` }}
                            >
                                {analytics.attendanceDistribution.excellent > 0 && `${analytics.attendanceDistribution.excellent}`}
                            </div>
                        )}
                        {goodPercent > 0 && (
                            <div
                                className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all"
                                style={{ width: `${goodPercent}%` }}
                            >
                                {analytics.attendanceDistribution.good > 0 && `${analytics.attendanceDistribution.good}`}
                            </div>
                        )}
                        {averagePercent > 0 && (
                            <div
                                className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all"
                                style={{ width: `${averagePercent}%` }}
                            >
                                {analytics.attendanceDistribution.average > 0 && `${analytics.attendanceDistribution.average}`}
                            </div>
                        )}
                        {poorPercent > 0 && (
                            <div
                                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all"
                                style={{ width: `${poorPercent}%` }}
                            >
                                {analytics.attendanceDistribution.poor > 0 && `${analytics.attendanceDistribution.poor}`}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span>Excellent (&gt;90%): {analytics.attendanceDistribution.excellent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span>Good (75-90%): {analytics.attendanceDistribution.good}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <span>Average (60-75%): {analytics.attendanceDistribution.average}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span>Poor (&lt;60%): {analytics.attendanceDistribution.poor}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
