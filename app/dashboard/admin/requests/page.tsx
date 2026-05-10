'use client'

import { useState, useEffect, useRef } from 'react'

import { useRequests, type Request, type RequestFilters, type RequestStats } from '@/hooks/useRequests'
import { RequestsTable } from '@/components/admin/RequestsTable'
import { RequestDetailsDialog } from '@/components/admin/RequestDetailsDialog'
import { RejectReasonDialog } from '@/components/admin/RejectReasonDialog'
import { RequestFilters as RequestFiltersComponent } from '@/components/admin/RequestFilters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

export default function AdminRequestsPage() {
    const { toast } = useToast()

    const [filters, setFilters] = useState<RequestFilters>({
        status: 'PENDING',
        type: '',
        priority: '',
        page: 1,
        limit: 20
    })

    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Local state for immediate UI updates
    const [localStats, setLocalStats] = useState<RequestStats | null>(null)
    const [localRequests, setLocalRequests] = useState<Request[]>([])
    const lastStatsRef = useRef<string>('')
    const lastRequestsRef = useRef<string>('')

    const { requests: apiRequests, stats: apiStats, pagination, isLoading, isError, refresh } = useRequests(filters)

    // Sync local state from API data (only when actual data changes)
    useEffect(() => {
        if (apiStats) {
            const statsJson = JSON.stringify(apiStats)
            if (statsJson !== lastStatsRef.current) {
                lastStatsRef.current = statsJson
                setLocalStats(apiStats)
            }
        }
    }, [apiStats])

    useEffect(() => {
        if (apiRequests && apiRequests.length >= 0) {
            const requestsJson = JSON.stringify(apiRequests.map(r => r.id))
            if (requestsJson !== lastRequestsRef.current) {
                lastRequestsRef.current = requestsJson
                setLocalRequests(apiRequests)
            }
        }
    }, [apiRequests])

    const handleViewDetails = (request: Request) => {
        setSelectedRequest(request)
        setDetailsOpen(true)
    }

    const handleApprove = async (request: Request) => {
        console.log('[handleApprove] Called with request:', request.id)
        if (isProcessing) {
            console.log('[handleApprove] Already processing, returning')
            return
        }
        setIsProcessing(true)
        console.log('[handleApprove] Starting approval for:', request.id)

        // OPTIMISTIC UPDATE - Update UI immediately
        setLocalRequests(prev => prev.filter(r => r.id !== request.id))
        setLocalStats(prev => prev ? {
            ...prev,
            pending: Math.max(0, prev.pending - 1),
            approved: prev.approved + 1
        } : prev)

        setDetailsOpen(false)
        setSelectedRequest(null)

        try {
            console.log('[handleApprove] Making API call to:', `/api/admin/requests/${request.id}/action`)
            const response = await fetch(`/api/admin/requests/${request.id}/action`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'APPROVE' })
            })

            console.log('[handleApprove] Response status:', response.status)
            const result = await response.json()
            console.log('[handleApprove] Response body:', result)

            if (!response.ok) {
                throw new Error(result.error?.message || 'Action failed')
            }

            toast({
                title: 'Success',
                description: 'Request approved successfully'
            })

            // Delayed refresh to sync with server
            setTimeout(() => refresh(), 2000)

        } catch (err: any) {
            // Rollback on error
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive'
            })
            // Refresh to restore correct state
            refresh()
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = (request: Request) => {
        setSelectedRequest(request)
        setRejectDialogOpen(true)
    }

    const handleConfirmReject = async (reason: string) => {
        if (!selectedRequest || isProcessing) return
        setIsProcessing(true)

        const requestId = selectedRequest.id

        // OPTIMISTIC UPDATE - Update UI immediately
        setLocalRequests(prev => prev.filter(r => r.id !== requestId))
        setLocalStats(prev => prev ? {
            ...prev,
            pending: Math.max(0, prev.pending - 1),
            rejected: prev.rejected + 1
        } : prev)

        setRejectDialogOpen(false)
        setDetailsOpen(false)
        setSelectedRequest(null)

        try {
            const response = await fetch(`/api/admin/requests/${requestId}/action`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REJECT', adminNote: reason })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Action failed')
            }

            toast({
                title: 'Success',
                description: 'Request rejected successfully'
            })

            // Delayed refresh to sync with server
            setTimeout(() => refresh(), 2000)

        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive'
            })
            refresh()
        } finally {
            setIsProcessing(false)
        }
    }

    const handleTabChange = (value: string) => {
        console.log('[handleTabChange] Switching to tab:', value)
        // CRITICAL: Clear local state and reset filters when switching tabs
        setLocalRequests([])
        lastRequestsRef.current = ''
        // Reset type and priority to ALL when changing tabs
        setFilters({
            status: value,
            type: '',       // Reset to ALL
            priority: '',   // Reset to ALL
            page: 1,
            limit: 20
        })
    }

    const clearFilters = () => {
        setFilters({
            status: 'PENDING',
            type: '',
            priority: '',
            page: 1,
            limit: 20
        })
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Requests</h2>
                    <p className="text-muted-foreground">
                        Manage leave, transfer, and other requests
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => refresh()} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {localStats ? (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{localStats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting action</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{localStats.underReview}</div>
                            <p className="text-xs text-muted-foreground">Being processed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{localStats.approved}</div>
                            <p className="text-xs text-muted-foreground">Total approved</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{localStats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Total rejected</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-20" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-12" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Queue</CardTitle>
                    <CardDescription>
                        {pagination ? `${pagination.totalRequests} total requests` : 'Loading...'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Tabs */}
                    <Tabs value={filters.status} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="PENDING">
                                Pending {localStats?.pending ? `(${localStats.pending})` : ''}
                            </TabsTrigger>
                            <TabsTrigger value="UNDER_REVIEW">Under Review</TabsTrigger>
                            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Filters */}
                    <RequestFiltersComponent
                        type={filters.type || ''}
                        priority={filters.priority || ''}
                        onTypeChange={(type) => setFilters(prev => ({ ...prev, type, page: 1 }))}
                        onPriorityChange={(priority) => setFilters(prev => ({ ...prev, priority, page: 1 }))}
                        onClear={clearFilters}
                    />

                    {/* Table */}
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8 text-destructive">
                            Failed to load requests. Please try again.
                        </div>
                    ) : (
                        <RequestsTable
                            requests={localRequests.filter(r => r.status === filters.status)}
                            onViewDetails={handleViewDetails}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <RequestDetailsDialog
                request={selectedRequest}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onApprove={() => selectedRequest && handleApprove(selectedRequest)}
                onReject={() => setRejectDialogOpen(true)}
            />

            <RejectReasonDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={handleConfirmReject}
                isLoading={isProcessing}
            />
        </div>
    )
}
