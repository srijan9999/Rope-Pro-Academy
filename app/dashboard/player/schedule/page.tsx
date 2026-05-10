"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Calendar, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { AttendanceCalendar } from "@/components/player/AttendanceCalendar"
import { RequestLeaveDialog } from "@/components/player/RequestLeaveDialog"
import { useAttendance } from "@/hooks/useAttendance"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorState } from "@/components/ui/error-state"

export default function SchedulePage() {
    const { data: session } = useSession()
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
    const { attendance, stats, isLoading, isError, refresh } = useAttendance()

    const handleDownloadReport = () => {
        // Mock download functionality
        alert("Monthly attendance report downloading...")
    }

    return (
        <div className="container py-8 space-y-8 max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-bold uppercase">My Class Schedule & Attendance</h1>
                <p className="text-muted-foreground">Track your classes and request leave when needed.</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" />
                </div>
            ) : isError ? (
                <ErrorState
                    title="Failed to load schedule"
                    message="We couldn't fetch your attendance data. Please try again."
                    onRetry={() => refresh()}
                />
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.total}</div>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Scheduled this month</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Present</CardTitle>
                                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.present}</div>
                                <p className="text-xs text-green-600 dark:text-green-300 mt-1">Classes attended</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✕</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.absent}</div>
                                <p className="text-xs text-red-600 dark:text-red-300 mt-1">Classes missed</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendance Calendar */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Attendance
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <span>Present</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <span>Absent</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                        <span>Leave</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AttendanceCalendar attendance={attendance} />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={() => setIsLeaveDialogOpen(true)}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 gap-2"
                        >
                            <FileText className="h-5 w-5" />
                            Request Leave
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleDownloadReport}
                            className="gap-2"
                        >
                            <Download className="h-5 w-5" />
                            Download Monthly Report
                        </Button>
                    </div>
                </>
            )}

            {/* Request Leave Dialog */}
            <RequestLeaveDialog
                open={isLeaveDialogOpen}
                onClose={() => setIsLeaveDialogOpen(false)}
                onSuccess={() => {
                    setIsLeaveDialogOpen(false)
                    refresh()
                }}
            />
        </div>
    )
}
