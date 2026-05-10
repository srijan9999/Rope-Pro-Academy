"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
    Check,
    X,
    Clock,
    Loader2,
    Users,
    CheckCircle2,
    XCircle,
    Timer,
    RotateCcw,
    Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { VoiceAttendance } from "./VoiceAttendance"

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | null

interface Student {
    id: string
    studentId: string
    name: string
    photoUrl?: string | null
    age?: number | null
    currentStatus?: string | null // From existing attendance
}

interface QuickAttendanceProps {
    batchId: string
    batchName: string
    students: Student[]
    date?: Date
    existingAttendance?: Record<string, { status: string; notes?: string }>
    onSaveComplete?: () => void
}

export function QuickAttendance({
    batchId,
    batchName,
    students,
    date = new Date(),
    existingAttendance = {},
    onSaveComplete
}: QuickAttendanceProps) {
    const { toast } = useToast()
    const [isSaving, setIsSaving] = useState(false)

    // Initialize state from existing attendance
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
        const initial: Record<string, AttendanceStatus> = {}
        students.forEach(s => {
            const existing = existingAttendance[s.id]
            if (existing) {
                initial[s.id] = existing.status as AttendanceStatus
            } else {
                initial[s.id] = null
            }
        })
        return initial
    })

    const [lateInfo, setLateInfo] = useState<Record<string, { minutes: number; time: string }>>({})

    // Calculate summary
    const summary = useMemo(() => {
        const values = Object.values(attendance)
        return {
            total: students.length,
            marked: values.filter(v => v !== null).length,
            present: values.filter(v => v === 'PRESENT').length,
            absent: values.filter(v => v === 'ABSENT').length,
            late: values.filter(v => v === 'LATE').length
        }
    }, [attendance, students.length])

    // Mark student attendance
    const markAttendance = useCallback((studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === status ? null : status  // Toggle if same
        }))
    }, [])

    // Mark all present
    const handleMarkAllPresent = useCallback(() => {
        const newState: Record<string, AttendanceStatus> = {}
        students.forEach(s => {
            newState[s.id] = 'PRESENT'
        })
        setAttendance(newState)
        toast({
            title: "Marked All Present",
            description: `All ${students.length} students marked as present`,
        })
    }, [students, toast])

    // Mark all absent
    const handleMarkAllAbsent = useCallback(() => {
        const newState: Record<string, AttendanceStatus> = {}
        students.forEach(s => {
            newState[s.id] = 'ABSENT'
        })
        setAttendance(newState)
        toast({
            title: "Marked All Absent",
            description: `All ${students.length} students marked as absent`,
        })
    }, [students, toast])

    // Clear all
    const handleClearAll = useCallback(() => {
        const newState: Record<string, AttendanceStatus> = {}
        students.forEach(s => {
            newState[s.id] = null
        })
        setAttendance(newState)
        setLateInfo({})
        toast({
            title: "Changes Cleared",
            description: "All attendance marks have been reset",
        })
    }, [students, toast])

    // Save attendance
    const handleSave = async () => {
        // Filter only marked students
        const records = Object.entries(attendance)
            .filter(([_, status]) => status !== null)
            .map(([studentId, status]) => {
                const late = lateInfo[studentId]
                return {
                    studentId,
                    status: status as string,
                    ...(status === 'LATE' && late ? {
                        minutesLate: late.minutes,
                        arrivalTime: late.time
                    } : {})
                }
            })

        if (records.length === 0) {
            toast({
                title: "No Changes",
                description: "Please mark at least one student's attendance",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)

        try {
            const response = await fetch('/api/coach/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    batchId,
                    date: format(date, 'yyyy-MM-dd'),
                    records
                })
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || 'Failed to save attendance')
            }

            toast({
                title: "✅ Attendance Saved",
                description: `Marked ${result.data.marked} students. Attendance rate: ${result.data.attendanceRate}%`,
            })

            onSaveComplete?.()

        } catch (error) {
            console.error('Save attendance error:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save attendance",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Get status-based styles
    const getStatusStyles = (status: AttendanceStatus) => {
        switch (status) {
            case 'PRESENT':
                return 'bg-green-50 dark:bg-green-950/30 border-green-500 ring-green-500/20'
            case 'ABSENT':
                return 'bg-red-50 dark:bg-red-950/30 border-red-500 ring-red-500/20'
            case 'LATE':
                return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 ring-yellow-500/20'
            default:
                return 'bg-card border-border hover:border-primary/50'
        }
    }

    const getStatusBadge = (status: AttendanceStatus) => {
        switch (status) {
            case 'PRESENT':
                return <Badge className="bg-green-500 text-white">Present</Badge>
            case 'ABSENT':
                return <Badge className="bg-red-500 text-white">Absent</Badge>
            case 'LATE':
                return <Badge className="bg-yellow-500 text-white">Late</Badge>
            default:
                return <Badge variant="outline" className="text-muted-foreground">Not Marked</Badge>
        }
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Mark Attendance
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {batchName} • {format(date, 'EEEE, MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Voice Attendance - for hands-free marking */}
                        <VoiceAttendance
                            students={students.map(s => ({ id: s.id, name: s.name }))}
                            onMark={(studentId, status) => {
                                if (studentId === 'all') {
                                    if (status === 'PRESENT') handleMarkAllPresent()
                                    else if (status === 'ABSENT') handleMarkAllAbsent()
                                } else {
                                    markAttendance(studentId, status)
                                }
                            }}
                            onSave={handleSave}
                            onClear={handleClearAll}
                            disabled={isSaving}
                        />

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllPresent}
                            disabled={isSaving}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                            Mark All Present
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={isSaving}
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || summary.marked === 0}
                            className="gap-2 min-w-[100px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                {/* Live Summary Bar */}
                {summary.marked > 0 && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg flex flex-wrap items-center gap-4 text-sm">
                        <span className="font-medium">
                            Marked: <span className="text-primary">{summary.marked}/{summary.total}</span>
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                {summary.present} Present
                            </span>
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <XCircle className="h-4 w-4" />
                                {summary.absent} Absent
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <Timer className="h-4 w-4" />
                                {summary.late} Late
                            </span>
                        </div>
                    </div>
                )}

                {/* Student Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {students.map((student) => {
                        const status = attendance[student.id]

                        return (
                            <div
                                key={student.id}
                                className={cn(
                                    "rounded-lg border-2 p-4 transition-all duration-200 ring-2",
                                    getStatusStyles(status)
                                )}
                            >
                                {/* Student Info */}
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={student.photoUrl || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                                            {student.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{student.name}</p>
                                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mb-3">
                                    {getStatusBadge(status)}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        variant={status === 'PRESENT' ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            "flex-1",
                                            status === 'PRESENT' && "bg-green-600 hover:bg-green-700"
                                        )}
                                        onClick={() => markAttendance(student.id, 'PRESENT')}
                                        disabled={isSaving}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={status === 'LATE' ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            "flex-1",
                                            status === 'LATE' && "bg-yellow-600 hover:bg-yellow-700"
                                        )}
                                        onClick={() => markAttendance(student.id, 'LATE')}
                                        disabled={isSaving}
                                    >
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={status === 'ABSENT' ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            "flex-1",
                                            status === 'ABSENT' && "bg-red-600 hover:bg-red-700"
                                        )}
                                        onClick={() => markAttendance(student.id, 'ABSENT')}
                                        disabled={isSaving}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Late Minutes Input (shown when marked late) */}
                                {status === 'LATE' && (
                                    <div className="mt-2">
                                        <Input
                                            type="number"
                                            placeholder="Minutes late"
                                            min="1"
                                            max="60"
                                            className="h-8 text-sm"
                                            value={lateInfo[student.id]?.minutes || ''}
                                            onChange={(e) => setLateInfo(prev => ({
                                                ...prev,
                                                [student.id]: {
                                                    minutes: parseInt(e.target.value) || 0,
                                                    time: prev[student.id]?.time || format(new Date(), 'HH:mm')
                                                }
                                            }))}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {students.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No students in this batch</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
