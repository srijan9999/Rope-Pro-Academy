"use client"

import { useState, useEffect, Suspense } from "react"

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
import { Search, Filter, Eye, RefreshCw, X, ChevronLeft, ChevronRight, AlertCircle, Lock } from "lucide-react"
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

function UserDetailsModal({ user, onClose }: { user: PaginatedUser | null; onClose: () => void }) {
    if (!user) return null

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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={
                        user.status === "ACTIVE" ? "bg-green-600" :
                            user.status === "PENDING" ? "bg-yellow-500" : "bg-gray-500"
                    }>
                        {user.status}
                    </Badge>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Joined</p>
                    <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <Badge variant="outline">{user.role === 'STUDENT' ? 'Player' : user.role}</Badge>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
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
                        <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="STUDENT">Players</SelectItem>
                                <SelectItem value="COACH">Coaches</SelectItem>
                                <SelectItem value="ADMIN">Admins</SelectItem>
                            </SelectContent>
                        </Select>
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
                                    Search: "{filters.query}"
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
                                                user.status === "ACTIVE" ? "bg-green-600 hover:bg-green-700" :
                                                    user.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600 shadow-none border-yellow-200" :
                                                        "bg-gray-500"
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
                    <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
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
