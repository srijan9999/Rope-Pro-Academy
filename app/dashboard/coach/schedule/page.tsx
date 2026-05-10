"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, TrendingUp, Loader2, RefreshCw, AlertCircle, ClipboardCheck } from "lucide-react"
import { useCoachBatches } from "@/hooks/useCoachBatches"
import { useBatchStudents } from "@/hooks/useBatchStudents"
import { StudentRoster } from "@/components/coach/StudentRoster"
import { BatchAnalytics } from "@/components/coach/BatchAnalytics"
import { QuickAttendance } from "@/components/coach/QuickAttendance"
import { ErrorState } from "@/components/ui/error-state"

export default function CoachSchedulePage() {
    const [selectedBatchId, setSelectedBatchId] = useState<string>("")

    const { batches, summary, isLoading, isError, refresh } = useCoachBatches({ includeStats: true })
    const {
        students,
        analytics,
        batch: selectedBatchInfo,
        isLoading: loadingStudents,
        isError: errorStudents,
        refresh: refreshStudents
    } = useBatchStudents(selectedBatchId, { includeAttendance: true })

    const selectedBatch = batches.find(b => b.id === selectedBatchId)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your batches...</p>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-8">
                <ErrorState
                    title="Failed to Load Batches"
                    message="We couldn't fetch your batch data. Please try again."
                    onRetry={() => refresh()}
                />
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-8 max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold uppercase">My Schedule</h1>
                    <p className="text-muted-foreground">Manage your batches and track student progress</p>
                </div>
                <Button variant="outline" onClick={() => refresh()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">My Batches</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.activeBatches}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary.totalBatches} total batches
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all batches
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.averageAttendance}%</div>
                        <p className="text-xs text-muted-foreground">
                            Overall attendance rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.upcomingSessionsToday}</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled for today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Batch Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Batch</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium mb-2 block">Choose a batch to view students</label>
                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a batch..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.length === 0 ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            No batches assigned to you
                                        </div>
                                    ) : (
                                        batches.map(batch => (
                                            <SelectItem key={batch.id} value={batch.id}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{batch.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {batch.currentEnrollment}/{batch.maxStudents}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        • {batch.academy.name}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => refreshStudents()}
                            disabled={!selectedBatchId || loadingStudents}
                            className="w-full md:w-auto"
                        >
                            {loadingStudents ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                'Load Students'
                            )}
                        </Button>
                    </div>

                    {/* Selected Batch Info */}
                    {selectedBatch && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">{selectedBatch.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedBatch.academy.name}
                                        {selectedBatch.academy.location && ` • ${selectedBatch.academy.location}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedBatch.timeSlot}
                                        {selectedBatch.daysOfWeek.length > 0 && (
                                            <> • {selectedBatch.daysOfWeek.join(', ')}</>
                                        )}
                                    </p>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        <Badge>{selectedBatch.skillLevel}</Badge>
                                        <Badge variant="outline">{selectedBatch.ageGroup}</Badge>
                                        <Badge variant="secondary">{selectedBatch.status}</Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {selectedBatch.utilizationPercentage}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Capacity ({selectedBatch.currentEnrollment}/{selectedBatch.maxStudents})
                                    </p>
                                </div>
                            </div>

                            {/* Session Progress */}
                            {selectedBatch.totalSessions > 0 && (
                                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Batch Progress</span>
                                        <span className="font-medium">
                                            {selectedBatch.completedSessions}/{selectedBatch.totalSessions} sessions
                                        </span>
                                    </div>
                                    <Progress value={selectedBatch.progressPercentage} className="h-2" />
                                </div>
                            )}

                            {/* Quick Stats */}
                            {selectedBatch.stats && (
                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Avg Attendance</p>
                                        <p className="text-lg font-semibold">{selectedBatch.stats.averageAttendance}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">On Track</p>
                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            {selectedBatch.stats.studentsOnTrack}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Need Attention</p>
                                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                            {selectedBatch.stats.studentsNeedingAttention}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Student Roster */}
            {selectedBatchId && (
                <>
                    {loadingStudents ? (
                        <Card>
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading students...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : errorStudents ? (
                        <ErrorState
                            title="Failed to Load Students"
                            message="We couldn't fetch the student roster. Please try again."
                            onRetry={() => refreshStudents()}
                        />
                    ) : students.length === 0 ? (
                        <Card>
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
                                    <p className="text-sm text-muted-foreground">
                                        This batch doesn't have any students yet
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Tabbed View: Attendance & Roster */}
                            <Tabs defaultValue="attendance" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 max-w-md">
                                    <TabsTrigger value="attendance" className="gap-2">
                                        <ClipboardCheck className="h-4 w-4" />
                                        Mark Attendance
                                    </TabsTrigger>
                                    <TabsTrigger value="roster" className="gap-2">
                                        <Users className="h-4 w-4" />
                                        Student Roster
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="attendance" className="mt-6">
                                    {/* Quick Attendance Component */}
                                    <QuickAttendance
                                        batchId={selectedBatchId}
                                        batchName={selectedBatch?.name || 'Batch'}
                                        students={students.map(s => ({
                                            id: s.id,
                                            studentId: s.studentId,
                                            name: s.fullName,
                                            photoUrl: s.photoUrl,
                                            age: s.age
                                        }))}
                                        onSaveComplete={() => refreshStudents()}
                                    />
                                </TabsContent>

                                <TabsContent value="roster" className="mt-6 space-y-6">
                                    {/* Analytics Overview */}
                                    <BatchAnalytics analytics={analytics} />

                                    {/* Student List */}
                                    <StudentRoster
                                        students={students}
                                        batchId={selectedBatchId}
                                        onRefresh={() => refreshStudents()}
                                    />
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </>
            )}

            {/* Empty State - No Batch Selected */}
            {!selectedBatchId && batches.length > 0 && (
                <Card className="border-dashed">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Select a Batch</h3>
                            <p className="text-sm text-muted-foreground">
                                Choose a batch from the dropdown above to view and manage students
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State - No Batches */}
            {batches.length === 0 && (
                <Card className="border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Batches Assigned</h3>
                            <p className="text-sm text-muted-foreground">
                                You don't have any batches assigned yet. Contact admin if you believe this is an error.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
