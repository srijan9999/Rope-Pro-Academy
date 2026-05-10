'use client'

import { TrendingUp, Star, Award, Target, Activity, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useProgress } from '@/hooks/useProgress'
import { ProgressChart } from '@/components/player/ProgressChart'
import { SkeletonProgress } from '@/components/player/SkeletonProgress'
import { ErrorState } from '@/components/ui/error-state'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

export default function ProgressPage() {
    const { progress, isLoading, isError, refresh } = useProgress()

    if (isLoading) {
        return <SkeletonProgress />
    }

    if (isError) {
        return <ErrorState message="Failed to load progress data" onRetry={refresh} />
    }

    const { currentReport, history, trends, milestones, stats } = progress

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'BEGINNER': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'ADVANCED': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'COMPETITIVE': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'text-green-600'
        if (grade.startsWith('B')) return 'text-blue-600'
        if (grade.startsWith('C')) return 'text-yellow-600'
        return 'text-red-600'
    }

    if (!currentReport) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Activity className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-1">No Progress Reports Yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Your coach will create your first progress report soon.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-heading">PROGRESS & LEVELS</h1>
                <p className="text-muted-foreground mt-1">
                    Track your skill development and advancement journey.
                </p>
            </div>

            {/* Current Level Section */}
            <Card className="relative overflow-hidden border-none shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <CardTitle>Current Level</CardTitle>
                                <p className="text-sm text-muted-foreground">Your training progression</p>
                            </div>
                        </div>
                        <Badge className={cn("text-sm px-4 py-1 font-bold", getLevelColor(currentReport.currentLevel))}>
                            {currentReport.currentLevel}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress to Next Level */}
                    {currentReport.recommendedLevel && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">
                                    Progress to {currentReport.recommendedLevel.toLowerCase()}
                                </span>
                                <span className="text-sm font-bold">{currentReport.proficiency.overall}%</span>
                            </div>
                            <Progress value={currentReport.proficiency.overall} className="h-3" />
                        </div>
                    )}

                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Speed */}
                        <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
                            <div className="text-xs font-semibold text-orange-600/80 uppercase tracking-wider mb-1">Speed</div>
                            <div className="text-2xl font-bold text-orange-700">
                                {currentReport.metrics.speed}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                jumps/min (Target: 100)
                            </div>
                        </div>

                        {/* Endurance */}
                        <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-100 shadow-sm">
                            <div className="text-xs font-semibold text-pink-600/80 uppercase tracking-wider mb-1">Endurance</div>
                            <div className="text-2xl font-bold text-pink-700">
                                {currentReport.metrics.endurance} <span className="text-sm font-medium">min</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                continuous (Target: 5)
                            </div>
                        </div>

                        {/* Freestyle */}
                        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">
                            <div className="text-xs font-semibold text-purple-600/80 uppercase tracking-wider mb-1">Freestyle</div>
                            <div className="text-2xl font-bold text-purple-700">
                                {currentReport.metrics.freestyle}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                tricks mastered
                            </div>
                        </div>

                        {/* Double Unders */}
                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                            <div className="text-xs font-semibold text-blue-600/80 uppercase tracking-wider mb-1">Double Unders</div>
                            <div className="text-2xl font-bold text-blue-700">
                                {currentReport.metrics.doubleUnders}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                consecutive
                            </div>
                        </div>
                    </div>

                    {/* Assessment Info */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Assessed by</span>
                            <Avatar className="h-6 w-6 border">
                                <AvatarImage src={currentReport.coach.photo_url || undefined} />
                                <AvatarFallback>
                                    {currentReport.coach.full_name?.substring(0, 2).toUpperCase() || 'CO'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{currentReport.coach.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Grade:</span>
                            <span className={cn("text-xl font-black", getGradeColor(currentReport.grade))}>
                                {currentReport.grade.replace('_', '+')}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Skill Proficiency Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Skill Proficiency
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Your performance across disciplines
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Speed */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-lg">⚡</span>
                                    Speed
                                </span>
                                <span className="text-sm font-bold text-orange-600">
                                    {currentReport.proficiency.speed}%
                                </span>
                            </div>
                            <Progress
                                value={currentReport.proficiency.speed}
                                className="h-2.5"
                            />
                        </div>

                        {/* Endurance */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-lg">❤️</span>
                                    Endurance
                                </span>
                                <span className="text-sm font-bold text-pink-600">
                                    {currentReport.proficiency.endurance}%
                                </span>
                            </div>
                            <Progress
                                value={currentReport.proficiency.endurance}
                                className="h-2.5"
                            />
                        </div>

                        {/* Freestyle */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-lg">🎨</span>
                                    Freestyle
                                </span>
                                <span className="text-sm font-bold text-purple-600">
                                    {currentReport.proficiency.freestyle}%
                                </span>
                            </div>
                            <Progress
                                value={currentReport.proficiency.freestyle}
                                className="h-2.5"
                            />
                        </div>

                        {/* Double Unders */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-lg">🔵</span>
                                    Double Unders
                                </span>
                                <span className="text-sm font-bold text-blue-600">
                                    {currentReport.proficiency.doubleUnders}%
                                </span>
                            </div>
                            <Progress
                                value={currentReport.proficiency.doubleUnders}
                                className="h-2.5"
                            />
                        </div>

                        {/* Technique */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-lg">🎯</span>
                                    Technique
                                </span>
                                <span className="text-sm font-bold text-gray-600">
                                    {currentReport.proficiency.technique}%
                                </span>
                            </div>
                            <Progress
                                value={currentReport.proficiency.technique}
                                className="h-2.5"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Coach Feedback Section */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Coach Feedback
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Recent notes and remarks
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {[currentReport, ...history.slice(0, 3)].map((report, index) => (
                            <div
                                key={report.id}
                                className={cn(
                                    "p-4 rounded-lg border flex gap-3 transition-colors",
                                    index === 0 ? "bg-green-50/50 border-green-200" : "bg-card border-border hover:bg-accent/5"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    index === 0 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {index === 0 ? <Star className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm">
                                            Coach {report.coach.full_name.split(' ')[0]}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                            {format(parseISO(report.date), 'MMM d')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {report.feedback}
                                    </p>
                                    {report.improvement !== undefined && report.improvement !== null && report.improvement > 0 && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                                            <TrendingUp className="h-3 w-3" />
                                            <span>+{report.improvement}% improvement</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Progress Chart */}
            {history.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Performance History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProgressChart history={[currentReport, ...history] as any} />
                    </CardContent>
                </Card>
            )}

            {/* Milestones */}
            {milestones.achieved.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            Achievements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {milestones.achieved.map(milestone => (
                                <div key={milestone.id} className="flex items-center gap-3 p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg">
                                    <span className="text-2xl">{milestone.badge || '🏆'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{milestone.title}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {format(parseISO(milestone.achievedDate), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">{milestone.points} pts</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
