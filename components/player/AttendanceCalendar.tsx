'use client'

import { cn } from '@/lib/utils'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'

interface AttendanceCalendarProps {
    attendance: Array<{
        date: string // ISO string from API
        status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'NO_CLASS'
    }>
}

export function AttendanceCalendar({ attendance }: AttendanceCalendarProps) {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getAttendanceForDate = (date: Date) => {
        return attendance.find(a =>
            format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="space-y-2">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Actual days */}
                {days.map(day => {
                    const attendanceRecord = getAttendanceForDate(day)
                    const isPast = day < today
                    const isCurrentDay = isToday(day)

                    return (
                        <div
                            key={format(day, 'yyyy-MM-dd')}
                            className={cn(
                                'aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center transition-all',
                                !attendanceRecord && 'border-gray-200 bg-gray-50',
                                attendanceRecord?.status === 'PRESENT' && 'border-green-500 bg-green-50',
                                attendanceRecord?.status === 'ABSENT' && 'border-red-500 bg-red-50',
                                attendanceRecord?.status === 'LEAVE' && 'border-yellow-500 bg-yellow-50',
                                isCurrentDay && 'ring-2 ring-primary ring-offset-2'
                            )}
                        >
                            <span className="text-lg font-semibold">
                                {format(day, 'd')}
                            </span>
                            {attendanceRecord && (
                                <div
                                    className={cn(
                                        'h-2 w-2 rounded-full mt-1',
                                        attendanceRecord.status === 'PRESENT' && 'bg-green-500',
                                        attendanceRecord.status === 'ABSENT' && 'bg-red-500',
                                        attendanceRecord.status === 'LEAVE' && 'bg-yellow-500'
                                    )}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
