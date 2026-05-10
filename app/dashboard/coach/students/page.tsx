"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Search,
    Users,
    Eye,
    Loader2,
    RefreshCw,
    AlertCircle,
    Flame,
    UserX
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useCoachStudents } from "@/hooks/useCoachStudents"
import { ErrorState } from "@/components/ui/error-state"
import { useDebounce } from "@/hooks/useDebounce"

export default function CoachStudentsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedBatch, setSelectedBatch] = useState<string>("all")
    const [selectedLevel, setSelectedLevel] = useState<string>("all")

    const debouncedSearch = useDebounce(searchQuery, 300)

    const {
        students,
        batches,
        noBatchesAssigned,
        summary,
        isLoading,
        isError,
        refresh
    } = useCoachStudents({
        search: debouncedSearch,
        batchId: selectedBatch !== "all" ? selectedBatch : undefined,
        level: selectedLevel !== "all" ? selectedLevel : undefined
    })

    const getLevelBadgeColor = (level: string) => {
        const levelLower = level.toLowerCase()
        switch (levelLower) {
            case "advanced":
            case "competitive":
                return "bg-gradient-to-r from-red-500 to-red-600 border-0"
            case "intermediate":
                return "bg-gradient-to-r from-yellow-500 to-orange-500 border-0"
            case "beginner":
                return "bg-gradient-to-r from-green-500 to-emerald-600 border-0"
            default:
                return "bg-secondary"
        }
    }

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600 dark:text-green-400"
        if (percentage >= 75) return "text-blue-600 dark:text-blue-400"
        if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
        return "text-red-600 dark:text-red-400"
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="container py-8 max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading students...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="container py-8 max-w-6xl mx-auto px-6">
                <ErrorState
                    title="Failed to Load Students"
                    message="We couldn't fetch your student roster. Please try again."
                    onRetry={() => refresh()}
                />
            </div>
        )
    }

    // No batches assigned state
    if (noBatchesAssigned) {
        return (
            <div className="container py-8 max-w-6xl mx-auto px-6">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="font-heading text-3xl font-bold uppercase">My Student Roster</h1>
                    <p className="text-muted-foreground">View assigned students and manage their progress reports.</p>
                </div>

                <Card className="border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <UserX className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Batches Assigned</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                You don't have any batches assigned to you yet.
                                Please contact the Admin to get batches assigned.
                            </p>
                            <Button variant="outline" className="mt-6" onClick={() => refresh()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Check Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-8 max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="font-heading text-3xl font-bold uppercase">My Student Roster</h1>
                    <p className="text-muted-foreground">View assigned students and manage their progress reports.</p>
                </div>
                <Button variant="outline" onClick={() => refresh()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {summary.totalStudents}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                                %
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {summary.averageAttendance}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">My Batches</p>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {batches.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or ID..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="All Batches" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map(batch => (
                                <SelectItem key={batch.id} value={batch.id}>
                                    {batch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                            <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Students Table */}
            <Card>
                <CardHeader className="uppercase text-primary font-bold tracking-wider text-sm border-b bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Active Students ({students.length})
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-center">ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead className="text-center">Level</TableHead>
                                    <TableHead className="text-center">Attendance</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium text-muted-foreground text-center">
                                                {student.studentId}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={student.photoUrl || undefined} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                            {student.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="font-medium">{student.name}</span>
                                                        {student.age && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {student.age} years
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.batch ? (
                                                    <span className="text-sm">{student.batch.name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={`${getLevelBadgeColor(student.level)} text-white hover:opacity-90`}>
                                                    {student.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`font-semibold ${getAttendanceColor(student.attendance.percentage)}`}>
                                                        {student.attendance.percentage}%
                                                    </span>
                                                    {student.attendance.currentStreak >= 5 && (
                                                        <Flame className="h-4 w-4 text-orange-500" />
                                                    )}
                                                </div>
                                                {student.attendance.monthlyTotal > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {student.attendance.monthlyPresent}/{student.attendance.monthlyTotal} this month
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Report
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    {searchQuery || selectedBatch !== "all" || selectedLevel !== "all"
                                                        ? "No students match your filters."
                                                        : "No students found in your batches."
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
