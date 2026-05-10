"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { IndianRupee, Users, ClipboardList, TrendingUp, RefreshCw, AlertCircle, UserCheck } from "lucide-react"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <Card className="border-destructive">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-center text-sm text-muted-foreground">{message}</p>
                    <Button onClick={onRetry} variant="outline">
                        Try Again
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
    const { stats, recentRegistrations, isLoading, isError, errorMessage, refresh } = useAdminDashboard()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="font-heading text-3xl font-bold uppercase">Admin Overview</h1>
                    <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {isLoading ? (
                <DashboardSkeleton />
            ) : isError ? (
                <ErrorState message={errorMessage || "Failed to load dashboard data"} onRetry={refresh} />
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹1,24,000</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeStudents ?? 0}</div>
                                <p className="text-xs text-muted-foreground">Currently enrolled</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.pendingRequests?.total ?? 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.pendingRequests?.registrations ?? 0} registrations
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalCoaches?.total ?? 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.totalCoaches?.active ?? 0} active, {stats?.totalCoaches?.pending ?? 0} pending
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Registrations Table */}
                    <Card>
                        <CardHeader className="px-6 py-4 border-b">
                            <CardTitle className="text-lg">Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Name</TableHead>
                                        <TableHead className="text-center">Role</TableHead>
                                        <TableHead className="text-center">Date</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentRegistrations && recentRegistrations.length > 0 ? (
                                        recentRegistrations.map((reg) => (
                                            <TableRow key={reg.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                            {reg.profile.fullName?.charAt(0) || reg.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div>{reg.profile.fullName || 'Unknown'}</div>
                                                            <div className="text-xs text-muted-foreground">{reg.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">
                                                        {reg.role === 'STUDENT' ? 'Player' : reg.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground">
                                                    {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        className={
                                                            reg.status === "ACTIVE"
                                                                ? "bg-green-600 hover:bg-green-700"
                                                                : reg.status === "PENDING"
                                                                    ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 shadow-none border-yellow-200"
                                                                    : "bg-gray-500"
                                                        }
                                                    >
                                                        {reg.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No recent registrations
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
