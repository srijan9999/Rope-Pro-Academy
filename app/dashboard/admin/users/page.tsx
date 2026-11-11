"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, Eye, RefreshCw, X, ChevronLeft, ChevronRight, AlertCircle, CreditCard, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useUserFilters } from "@/hooks/useUserFilters"
import { useUserDirectory } from "@/hooks/useUserDirectory"
import { useDebounce } from "@/hooks/useDebounce"
import type { PaginatedUser } from "@/types/api"

// Helper to mask encrypted phone numbers
function formatPhone(phone: string | undefined | null): string {
    if (!phone) return "-"
    // If phone looks encrypted (too long or contains non-phone characters)
    if (phone.length > 15 || /[a-zA-Z]/.test(phone)) {
        return "🔒 Hidden"
    }
    return phone
}

function UserTableSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    )
}

function UserDetailsModal({
    user,
    onClose,
    onRefresh,
}: {
    user: PaginatedUser | null
    onClose: () => void
    onRefresh?: () => void
}) {
    const [actionLoading, setActionLoading] = useState(false)
    const [rejectionNote, setRejectionNote] = useState("")
    const [showRejectInput, setShowRejectInput] = useState(false)
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    if (!user) return null

    const handleViewResume = async () => {
        try {
            setActionLoading(true)
            setActionMessage(null)
            const res = await fetch(`/api/admin/coaches/${user.id}/resume`)
            const data = await res.json()
            if (data.success && data.url) {
                window.open(data.url, "_blank", "noopener,noreferrer")
            } else {
                setActionMessage({ type: "error", text: data.error || "No CV available for this coach." })
            }
        } catch {
            setActionMessage({ type: "error", text: "Failed to open CV document." })
        } finally {
            setActionLoading(false)
        }
    }

    const handleApproveCoach = async () => {
        try {
            setActionLoading(true)
            setActionMessage(null)
            const res = await fetch(`/api/admin/coaches/${user.id}/approve`, { method: "POST" })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to approve coach")
            setActionMessage({ type: "success", text: `Coach approved! ID Card: ${data.data?.idCardNumber}` })
            if (onRefresh) onRefresh()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Approval failed"
            setActionMessage({ type: "error", text: msg })
        } finally {
            setActionLoading(false)
        }
    }

    const handleRejectCoach = async () => {
        try {
            setActionLoading(true)
            setActionMessage(null)
            const res = await fetch(`/api/admin/coaches/${user.id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: rejectionNote }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to reject application")
            setActionMessage({ type: "success", text: "Application rejected." })
            setShowRejectInput(false)
            if (onRefresh) onRefresh()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Rejection failed"
            setActionMessage({ type: "error", text: msg })
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                {user.profile.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>

            {/* Name & Email */}
            <div>
                <h3 className="font-bold text-xl">{user.profile.fullName || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground">
                    {user.role === 'STUDENT' ? 'Player' : user.role} • {user.profile.studentId || user.profile.coachId || user.id.slice(0, 8)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>

            {/* Status Message */}
            {actionMessage && (
                <div className={`w-full p-2.5 rounded-lg text-xs font-semibold ${
                    actionMessage.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300"
                        : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300"
                }`}>
                    {actionMessage.text}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={
                        user.status === "ACTIVE" ? "bg-green-100 text-green-800 shadow-none border-green-200" :
                            user.status === "PENDING" ? "bg-yellow-100 text-yellow-800 shadow-none border-yellow-200" : "bg-gray-100 text-gray-800 shadow-none border-gray-200"
                    }>
                        {user.status}
                    </Badge>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Joined</p>
                    <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <Badge variant="outline">{user.role === 'STUDENT' ? 'Player' : user.role}</Badge>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Academy</p>
                    <p className="text-sm font-medium truncate">{user.profile.academy?.name || '-'}</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="w-full space-y-2 text-left">
                <h4 className="font-medium text-sm border-b pb-2">Details</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{formatPhone(user.profile.phone)}</span>
                    </div>
                    {user.profile.batch && (
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Batch</span>
                            <span className="font-medium">{user.profile.batch.name}</span>
                        </div>
                    )}
                    {user.profile.skillLevel && (
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Skill Level</span>
                            <Badge variant="outline">{user.profile.skillLevel}</Badge>
                        </div>
                    )}
                    {user.profile.specialization && (
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Specialization</span>
                            <span className="font-medium">{user.profile.specialization}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Coach CV / Application Actions */}
            {user.role === 'COACH' && (
                <div className="w-full space-y-2.5 pt-2 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={actionLoading}
                        onClick={handleViewResume}
                        className="w-full justify-center gap-2 text-xs font-semibold"
                    >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        View Applicant CV / Resume
                    </Button>

                    {user.status === 'PENDING' && (
                        <div className="space-y-2 pt-1">
                            {!showRejectInput ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={handleApproveCoach}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs gap-1.5 h-9"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Approve
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={actionLoading}
                                        onClick={() => setShowRejectInput(true)}
                                        className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-xs gap-1.5 h-9"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 text-left">
                                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                        Rejection Reason / Admin Note:
                                    </p>
                                    <Input
                                        placeholder="Reason for rejecting application..."
                                        value={rejectionNote}
                                        onChange={(e) => setRejectionNote(e.target.value)}
                                        className="text-xs h-8 bg-background"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={actionLoading}
                                            onClick={handleRejectCoach}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 flex-1"
                                        >
                                            Confirm Reject
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={actionLoading}
                                            onClick={() => setShowRejectInput(false)}
                                            className="text-xs h-7"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Action Links */}
            {(user.role === 'STUDENT' || user.role === 'COACH') && (
                <Button
                    asChild
                    className="w-full bg-[#E63946] hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wider h-9"
                >
                    <Link
                        href={user.role === 'STUDENT'
                            ? `/dashboard/player/id-card?userId=${user.id}`
                            : `/dashboard/coach/id-card?userId=${user.id}`
                        }
                        target="_blank"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Preview Digital ID Card
                    </Link>
                </Button>
            )}

            {/* Close Button */}
            <Button onClick={onClose} className="w-full" variant="outline">
                Close
            </Button>
        </div>
    )
}

function UsersPageContent() {
    const { filters, updateFilters, resetFilters, hasActiveFilters } = useUserFilters()
    const { users, pagination, isLoading, isError, errorMessage, refresh } = useUserDirectory(filters)
    const [selectedUser, setSelectedUser] = useState<PaginatedUser | null>(null)
    const [searchInput, setSearchInput] = useState(filters.query)
    const debouncedSearch = useDebounce(searchInput, 300)

    // Update URL when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== filters.query) {
            updateFilters({ query: debouncedSearch })
        }
    }, [debouncedSearch, filters.query, updateFilters])

    const handleRoleChange = (role: string) => {
        updateFilters({ role: role === 'all' ? '' : role })
    }

    const handleStatusChange = (status: string) => {
        updateFilters({ status: status === 'all' ? '' : status })
    }

    const handlePageChange = (page: number) => {
        updateFilters({ page })
    }

    return (
        <div className="container py-8 space-y-8 max-w-7xl w-full mx-auto px-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="font-heading text-3xl font-bold uppercase">User Directory</h1>
                    <p className="text-muted-foreground">Manage all players and coaches across academies.</p>
                </div>
                <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" /> Filter Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-9"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <div className="flex rounded-lg border bg-muted p-1 md:col-span-1">
                            <button
                                onClick={() => handleRoleChange("all")}
                                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    !filters.role
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleRoleChange("STUDENT")}
                                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filters.role === "STUDENT"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Students
                            </button>
                            <button
                                onClick={() => handleRoleChange("COACH")}
                                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filters.role === "COACH"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Coaches
                            </button>
                        </div>
                        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={resetFilters} className="gap-2">
                                <X className="h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {filters.query && (
                                <Badge variant="secondary" className="gap-1">
                                    Search: &quot;{filters.query}&quot;
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => {
                                            setSearchInput('')
                                            updateFilters({ query: '' })
                                        }}
                                    />
                                </Badge>
                            )}
                            {filters.role && (
                                <Badge variant="secondary" className="gap-1">
                                    Role: {filters.role === 'STUDENT' ? 'Player' : filters.role}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ role: '' })} />
                                </Badge>
                            )}
                            {filters.status && (
                                <Badge variant="secondary" className="gap-1">
                                    Status: {filters.status}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ status: '' })} />
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Summary */}
            {pagination && (
                <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.usersPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.usersPerPage, pagination.totalUsers)} of{' '}
                    {pagination.totalUsers} users
                </div>
            )}

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <UserTableSkeleton />
                    ) : isError ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <p className="text-muted-foreground">{errorMessage || "Failed to load users"}</p>
                            <Button onClick={refresh} variant="outline">Try Again</Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <p className="text-muted-foreground">
                                {hasActiveFilters ? "No users match your filters" : "No users found"}
                            </p>
                            {hasActiveFilters && (
                                <Button onClick={resetFilters} variant="outline">Clear Filters</Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-center">Role</TableHead>
                                    <TableHead className="text-center">Academy</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {user.profile.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.profile.fullName || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">
                                                {user.role === 'STUDENT' ? 'Player' : user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {user.profile.academy?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={
                                                user.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-200 shadow-none border-green-200" :
                                                    user.status === "PENDING" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 shadow-none border-yellow-200" :
                                                        "bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-none border-gray-200"
                                            }>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setSelectedUser(user)}>
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">User Details</DialogTitle>
                    </DialogHeader>
                    <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} onRefresh={refresh} />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="p-8"><UserTableSkeleton /></div>}>
            <UsersPageContent />
        </Suspense>
    )
}
