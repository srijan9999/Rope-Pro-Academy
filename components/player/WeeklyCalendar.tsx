'use client'

import { useState } from 'react'
import {
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    format,
    eachDayOfInterval,
    isSameDay,
    isToday,
    parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerSchedule } from '@/hooks/usePlayerSchedule'
import { cn } from '@/lib/utils'

export function WeeklyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())

    // Calculate range for current view
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })

    // Create array of days to render
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Fetch data
    const { events, isLoading, isError } = usePlayerSchedule(
        startDate.toISOString(),
        endDate.toISOString()
    )

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const handleToday = () => setCurrentDate(new Date())

    return (
        <div className="space-y-4">
            {/* Header & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold uppercase">
                        {format(startDate, 'MMMM yyyy')}
                    </h3>
                    <span className="text-muted-foreground text-sm hidden sm:inline">
                        Week of {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
                    <div className="flex items-center rounded-md border">
                        <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid (Desktop) / List (Mobile) */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">

                {/* Desktop Header Row */}
                <div className="hidden md:grid grid-cols-7 border-b divide-x">
                    {days.map(day => (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "p-3 text-center text-sm font-medium",
                                isToday(day) ? "bg-primary/5 text-primary" : "text-muted-foreground"
                            )}
                        >
                            <div>{format(day, 'EEE')}</div>
                            <div className={cn(
                                "mt-1 w-8 h-8 flex items-center justify-center rounded-full mx-auto",
                                isToday(day) && "bg-primary text-primary-foreground font-bold"
                            )}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                {isLoading ? (
                    <div className="p-12">
                        <Skeleton className="h-48 w-full" />
                    </div>
                ) : isError ? (
                    <div className="p-12 text-center text-red-500">Failed to load schedule</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x min-h-[300px]">
                        {days.map(day => {
                            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day))
                            const isEventToday = isToday(day)

                            return (
                                <div key={day.toISOString()} className={cn(
                                    "flex flex-col p-2 min-h-[100px] transition-colors",
                                    isEventToday ? "bg-primary/5" : ""
                                )}>
                                    {/* Mobile Date Header */}
                                    <div className="md:hidden flex items-center gap-2 mb-2 font-medium">
                                        <span className="text-muted-foreground">{format(day, 'EEE')}</span>
                                        <span className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-full",
                                            isEventToday && "bg-primary text-primary-foreground"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {/* Events List */}
                                    <div className="flex-1 space-y-2">
                                        {dayEvents.length === 0 && (
                                            <div className="hidden md:flex flex-1 items-center justify-center h-full">
                                                <span className="text-xs text-muted-foreground/30">No Classes</span>
                                            </div>
                                        )}

                                        {dayEvents.map(event => (
                                            <Card key={event.id} className="p-2 shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant={event.status === 'COMPLETED' ? 'secondary' : 'default'} className="text-[10px] px-1 py-0 h-4">
                                                            {event.startTime}
                                                        </Badge>
                                                    </div>

                                                    <p className="font-semibold text-xs line-clamp-2 leading-tight">
                                                        {event.title}
                                                    </p>

                                                    {event.location && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}

                                                    {event.coach && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <User className="h-3 w-3" />
                                                            <span className="truncate">{event.coach.fullName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
