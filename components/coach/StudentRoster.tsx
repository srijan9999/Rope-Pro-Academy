'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { AlertCircle, TrendingUp, TrendingDown, Flame, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BatchStudent } from '@/hooks/useBatchStudents'

interface StudentRosterProps {
    students: BatchStudent[]
    batchId: string
    onRefresh: () => void
}

type SortBy = 'name' | 'attendance' | 'performance'

export function StudentRoster({ students, batchId, onRefresh }: StudentRosterProps) {
    const [sortBy, setSortBy] = useState<SortBy>('name')

    const sortedStudents = [...students].sort((a, b) => {
        switch (sortBy) {
            case 'attendance':
                return b.attendance.percentage - a.attendance.percentage
            case 'performance':
                return (b.performance.latestScore || 0) - (a.performance.latestScore || 0)
            default:
                return a.fullName.localeCompare(b.fullName)
        }
    })

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600 dark:text-green-400'
        if (percentage >= 75) return 'text-blue-600 dark:text-blue-400'
        if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getAttendanceBadgeVariant = (percentage: number): "default" | "secondary" | "destructive" | "outline" => {
        if (percentage >= 90) return 'default'
        if (percentage >= 75) return 'secondary'
        if (percentage >= 60) return 'outline'
        return 'destructive'
    }

    const formatGrade = (grade: string | null) => {
        if (!grade) return 'N/A'
        return grade.replace('_PLUS', '+').replace('_MINUS', '-')
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2">
                        Student Roster ({students.length})
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={sortBy === 'name' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('name')}
                            className="gap-1"
                        >
                            <ArrowUpDown className="h-3 w-3" />
                            Name
                        </Button>
                        <Button
                            variant={sortBy === 'attendance' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('attendance')}
                            className="gap-1"
                        >
                            <ArrowUpDown className="h-3 w-3" />
                            Attendance
                        </Button>
                        <Button
                            variant={sortBy === 'performance' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('performance')}
                            className="gap-1"
                        >
                            <ArrowUpDown className="h-3 w-3" />
                            Performance
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Attendance</TableHead>
                                <TableHead>Performance</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStudents.map(student => (
                                <TableRow key={student.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={student.photoUrl || undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {student.fullName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{student.fullName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {student.studentId}
                                                    {student.age && ` • ${student.age} yrs`}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("font-bold text-lg", getAttendanceColor(student.attendance.percentage))}>
                                                    {student.attendance.percentage}%
                                                </span>
                                                {student.attendance.currentStreak > 2 && (
                                                    <Badge variant="outline" className="text-orange-500 border-orange-300 gap-1 text-xs">
                                                        <Flame className="h-3 w-3" />
                                                        {student.attendance.currentStreak}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {student.attendance.totalPresent}P / {student.attendance.totalAbsent}A
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {student.performance.latestScore !== null ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {student.performance.latestScore}%
                                                    </span>
                                                    {student.performance.improvement !== null && student.performance.improvement !== 0 && (
                                                        <Badge
                                                            variant={student.performance.improvement > 0 ? 'default' : 'destructive'}
                                                            className={cn(
                                                                "text-xs gap-1",
                                                                student.performance.improvement > 0 && "bg-green-600"
                                                            )}
                                                        >
                                                            {student.performance.improvement > 0 ? (
                                                                <TrendingUp className="h-3 w-3" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" />
                                                            )}
                                                            {student.performance.improvement > 0 ? '+' : ''}
                                                            {student.performance.improvement}%
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Grade: {formatGrade(student.performance.latestGrade)}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Not assessed</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {student.paymentStatus.isPaidThisMonth ? (
                                            <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                ₹{student.paymentStatus.pendingAmount.toLocaleString()} due
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {student.status}
                                            </Badge>
                                            {student.performance.needsAttention && (
                                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                Feedback
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {students.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No students in this batch</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
