'use client'

import { useSession } from 'next-auth/react'
import { Calendar, Star, Trophy, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard'
import { SkeletonDashboard } from '@/components/player/SkeletonDashboard'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { WeeklyCalendar } from '@/components/player/WeeklyCalendar'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

export default function PlayerDashboardPage() {
    const { data: session } = useSession()
    const { dashboard, isLoading, isError, refresh } = usePlayerDashboard()

    if (isLoading) {
        return (
            <div className="flex min-h-screen pt-16">
                <DashboardSidebar role="player" />
                <main className="flex-1 lg:pl-64">
                    <div className="container py-8 max-w-7xl mx-auto px-6">
                        <SkeletonDashboard />
                    </div>
                </main>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex min-h-screen pt-16">
                <DashboardSidebar role="player" />
                <main className="flex-1 lg:pl-64">
                    <div className="container py-8 max-w-7xl mx-auto px-6 text-center text-red-500">
                        Failed to load dashboard. <button onClick={() => refresh()} className="underline">Retry</button>
                    </div>
                </main>
            </div>
        )
    }

    const { student, attendance, nextClass, skillProgress, recentAchievements, coachFeedback } = dashboard

    // Format next class date/time
    const getNextClassDisplay = () => {
        if (!nextClass) {
            return {
                primary: 'No Classes Scheduled',
                secondary: 'Check back soon for updates'
            }
        }

        const classDate = new Date(nextClass.date)
        let dateText = ''

        if (isToday(classDate)) {
            dateText = 'Today'
        } else if (isTomorrow(classDate)) {
            dateText = 'Tomorrow'
        } else {
            dateText = format(classDate, 'EEEE, MMM d')
        }

        return {
            primary: `${dateText}, ${nextClass.time}`,
            secondary: `${nextClass.title} @ ${nextClass.academy.name}`
        }
    }

    const nextClassDisplay = getNextClassDisplay()

    return (
        <div className="container py-8 space-y-8 max-w-7xl mx-auto px-6">
            {/* Welcome Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">
                    WELCOME BACK, {student.full_name.split(' ')[0].toUpperCase()}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here is your training overview.
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upcoming Class Card */}
                <Card className={cn(
                    "relative overflow-hidden",
                    nextClass && "hover:shadow-lg transition-shadow"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Class</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {nextClassDisplay.primary}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {nextClassDisplay.secondary}
                        </p>
                        {nextClass && nextClass.status === 'CONFIRMED' && (
                            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                                Confirmed
                            </Badge>
                        )}
                    </CardContent>
                    {!nextClass && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-50" />
                    )}
                </Card>

                {/* Attendance Card */}
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {attendance.thisMonth.present}/{attendance.thisMonth.total}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Classes attended this month
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Progress
                                value={attendance.thisMonth.percentage}
                                className="h-2 flex-1"
                            />
                            <span className="text-xs font-medium">
                                {attendance.thisMonth.percentage}%
                            </span>
                        </div>
                        {attendance.trend.change !== 0 && (
                            <div className={cn(
                                "flex items-center gap-1 mt-2 text-xs",
                                attendance.trend.improving ? "text-green-600" : "text-red-600"
                            )}>
                                {attendance.trend.improving ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                <span>
                                    {attendance.trend.change > 0 ? '+' : ''}{attendance.trend.change}% vs last month
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Level Card */}
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">
                            {student.skill_level.toLowerCase()}
                        </div>
                        {skillProgress.nextAssessment && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Next Assessment: {format(parseISO(skillProgress.nextAssessment.date), 'MMM d')}
                            </p>
                        )}
                        {skillProgress.nextLevel && (
                            <div className="mt-3">
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-muted-foreground">
                                        Progress to {skillProgress.nextLevel.toLowerCase()}
                                    </span>
                                    <span className="font-medium">{skillProgress.progressToNext}%</span>
                                </div>
                                <Progress value={skillProgress.progressToNext} className="h-2" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Speed */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    ⚡ Speed
                                    <span className="text-xs text-muted-foreground">
                                        {skillProgress.metrics.speed.current} / {skillProgress.metrics.speed.target} jumps/min
                                    </span>
                                </span>
                                <span className="text-sm font-bold text-orange-600">
                                    {skillProgress.metrics.speed.percentage}%
                                </span>
                            </div>
                            <Progress value={skillProgress.metrics.speed.percentage} className="h-2 bg-orange-100" />
                        </div>

                        {/* Endurance */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    ❤️ Endurance
                                    <span className="text-xs text-muted-foreground">
                                        {skillProgress.metrics.endurance.current} / {skillProgress.metrics.endurance.target} min
                                    </span>
                                </span>
                                <span className="text-sm font-bold text-pink-600">
                                    {skillProgress.metrics.endurance.percentage}%
                                </span>
                            </div>
                            <Progress value={skillProgress.metrics.endurance.percentage} className="h-2 bg-pink-100" />
                        </div>

                        {/* Freestyle */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    🎨 Freestyle
                                    <span className="text-xs text-muted-foreground">
                                        {skillProgress.metrics.freestyle.current} / {skillProgress.metrics.freestyle.target} tricks
                                    </span>
                                </span>
                                <span className="text-sm font-bold text-purple-600">
                                    {skillProgress.metrics.freestyle.percentage}%
                                </span>
                            </div>
                            <Progress value={skillProgress.metrics.freestyle.percentage} className="h-2 bg-purple-100" />
                        </div>

                        {/* Double Unders */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    🔵 Double Unders
                                    <span className="text-xs text-muted-foreground">
                                        {skillProgress.metrics.doubleUnders.current} / {skillProgress.metrics.doubleUnders.target} consecutive
                                    </span>
                                </span>
                                <span className="text-sm font-bold text-blue-600">
                                    {skillProgress.metrics.doubleUnders.percentage}%
                                </span>
                            </div>
                            <Progress value={skillProgress.metrics.doubleUnders.percentage} className="h-2 bg-blue-100" />
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Achievements & Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Latest Coach Feedback */}
                        {coachFeedback.latest && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={coachFeedback.latest.coach.photo_url || ''} />
                                        <AvatarFallback>
                                            {coachFeedback.latest.coach.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium">
                                                Coach {coachFeedback.latest.coach.full_name.split(' ')[0]}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(parseISO(coachFeedback.latest.date), 'MMM d')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {coachFeedback.latest.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Achievements */}
                        {recentAchievements.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Recent Achievements</h4>
                                {recentAchievements.map(achievement => (
                                    <div
                                        key={achievement.id}
                                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                                    >
                                        <span className="text-2xl">{achievement.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{achievement.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(parseISO(achievement.date), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Attendance Streak */}
                        {attendance.streaks.current > 0 && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🔥</span>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {attendance.streaks.current} Day Streak!
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Keep it up! Your longest: {attendance.streaks.longest} days
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Training Schedule Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        TRAINING SCHEDULE
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <WeeklyCalendar />
                </CardContent>
            </Card>
        </div>
    )
}
