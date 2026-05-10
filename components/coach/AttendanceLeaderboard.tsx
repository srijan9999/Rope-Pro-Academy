"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Trophy, Medal, Flame, TrendingUp } from "lucide-react"
import useSWR from "swr"

interface LeaderboardEntry {
    rank: number
    studentId: string
    studentName: string
    photoUrl?: string | null
    attendanceRate: number
    streakDays: number
    totalPoints: number
}

interface AttendanceLeaderboardProps {
    batchId: string
    period?: string // e.g., "2026-02" for February 2026
    limit?: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function AttendanceLeaderboard({
    batchId,
    period = new Date().toISOString().slice(0, 7),
    limit = 10
}: AttendanceLeaderboardProps) {
    const { data, isLoading } = useSWR(
        `/api/coach/leaderboard?batchId=${batchId}&period=${period}&limit=${limit}`,
        fetcher,
        { revalidateOnFocus: false }
    )

    const entries: LeaderboardEntry[] = data?.data?.entries || []

    const getRankDisplay = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="text-2xl">🥇</span>
            case 2:
                return <span className="text-2xl">🥈</span>
            case 3:
                return <span className="text-2xl">🥉</span>
            default:
                return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
        }
    }

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-400"
            case 2:
                return "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/30 dark:to-gray-700/20 border-gray-400"
            case 3:
                return "bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-400"
            default:
                return "bg-card border-border"
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Attendance Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Attendance Leaderboard
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Top performers for {new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
            </CardHeader>
            <CardContent>
                {entries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No leaderboard data available yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry) => (
                            <div
                                key={entry.studentId}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                                    getRankStyle(entry.rank)
                                )}
                            >
                                {/* Rank */}
                                <div className="w-10 text-center">
                                    {getRankDisplay(entry.rank)}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={entry.photoUrl || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {entry.studentName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Name & Streak */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{entry.studentName}</p>
                                    {entry.streakDays > 0 && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Flame className="h-3 w-3 text-orange-500" />
                                            {entry.streakDays} day streak
                                        </p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary">
                                        {entry.attendanceRate}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.totalPoints} pts
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Streak Display Component for individual student
interface StreakDisplayProps {
    currentStreak: number
    longestStreak: number
    totalPoints: number
    badges?: { type: string; icon: string; name: string }[]
}

export function StreakDisplay({ currentStreak, longestStreak, totalPoints, badges = [] }: StreakDisplayProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    {/* Current Streak */}
                    <div className="space-y-1">
                        <div className="text-3xl font-bold flex items-center justify-center gap-1">
                            <Flame className="h-6 w-6 text-orange-500" />
                            {currentStreak}
                        </div>
                        <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>

                    {/* Longest Streak */}
                    <div className="space-y-1">
                        <div className="text-3xl font-bold flex items-center justify-center gap-1">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                            {longestStreak}
                        </div>
                        <p className="text-xs text-muted-foreground">Best Streak</p>
                    </div>

                    {/* Total Points */}
                    <div className="space-y-1">
                        <div className="text-3xl font-bold flex items-center justify-center gap-1">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            {totalPoints}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Points</p>
                    </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <p className="text-sm font-medium mb-2">Badges Earned</p>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((badge, i) => (
                                <Badge key={i} variant="secondary" className="gap-1">
                                    <span>{badge.icon}</span>
                                    {badge.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
