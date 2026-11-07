'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle2,
    XCircle,
    Clock,
    Image as ImageIcon,
    User,
    Mail,
    Phone,
    RefreshCw,
    Loader2,
    Hash,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Inbox,
} from 'lucide-react'

// --- Types ---

interface StudentUser {
    id: string
    email: string
    status: string
    createdAt: string
}

interface PendingStudent {
    id: string
    studentId: string
    fullName: string
    phone: string | null
    userId: string
    registrationFee: number
    registrationStatus: string
    paymentMethod: string | null
    paymentScreenshotUrl: string | null
    paymentScreenshotAt: string | null
    utrNumber: string | null
    createdAt: string
    user: StudentUser
}

interface ApiResponse {
    success: boolean
    data: PendingStudent[]
    count: number
}

// --- Fetcher ---

const fetcher = async (url: string): Promise<ApiResponse> => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Request failed' } }))
        throw new Error(error.error?.message || 'Failed to fetch pending payments')
    }
    return res.json()
}

// --- Helper ---

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// --- Main Page Component ---

export default function PendingPaymentsPage() {
    const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
        '/api/admin/pending-payments',
        fetcher,
        { revalidateOnFocus: false }
    )

    const [processingId, setProcessingId] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectNote, setRejectNote] = useState('')
    const [expandedImage, setExpandedImage] = useState<string | null>(null)
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

    const toggleCard = useCallback((studentId: string) => {
        setExpandedCards(prev => {
            const next = new Set(prev)
            if (next.has(studentId)) {
                next.delete(studentId)
            } else {
                next.add(studentId)
            }
            return next
        })
    }, [])

    const handleApprove = async (studentId: string) => {
        if (processingId) return
        setProcessingId(studentId)

        try {
            const res = await fetch('/api/admin/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, action: 'APPROVE' }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error?.message || 'Failed to approve payment')
            }

            // Refetch the list
            await mutate()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred'
            alert(`Error: ${message}`)
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (studentId: string) => {
        if (processingId) return
        setProcessingId(studentId)

        try {
            const res = await fetch('/api/admin/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    action: 'REJECT',
                    note: rejectNote.trim() || undefined,
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error?.message || 'Failed to reject payment')
            }

            // Reset rejection state
            setRejectingId(null)
            setRejectNote('')

            // Refetch the list
            await mutate()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred'
            alert(`Error: ${message}`)
        } finally {
            setProcessingId(null)
        }
    }

    const students = data?.data ?? []

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pending Payments</h2>
                    <p className="text-muted-foreground">
                        Review and verify student registration payment screenshots
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mutate()}
                        className="gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground">Screenshots awaiting review</p>
                    </CardContent>
                </Card>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">Loading pending payments...</span>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <Card className="border-destructive">
                    <CardContent className="flex items-center gap-3 py-8">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <p className="text-destructive">
                            Failed to load pending payments. Please try again.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => mutate()} className="ml-auto">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && students.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground">No Pending Payments</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            All payment screenshots have been reviewed. Check back later.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Student Cards */}
            {!isLoading && !error && students.length > 0 && (
                <div className="grid gap-4">
                    {students.map((student) => {
                        const isExpanded = expandedCards.has(student.id)
                        const isProcessing = processingId === student.id
                        const isRejecting = rejectingId === student.id

                        return (
                            <Card key={student.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                {student.fullName}
                                            </CardTitle>
                                            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {student.user.email}
                                                </span>
                                                {student.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {student.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Hash className="h-3.5 w-3.5" />
                                                    {student.studentId}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleCard(student.id)}
                                            className="gap-1 text-xs"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    Collapse
                                                    <ChevronUp className="h-4 w-4" />
                                                </>
                                            ) : (
                                                <>
                                                    Expand
                                                    <ChevronDown className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Info Row */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-muted-foreground">Registered:</span>
                                            <span className="font-medium">
                                                {formatDate(student.user.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
                                            <span className="text-muted-foreground">Fee:</span>
                                            <span className="font-medium">₹{student.registrationFee}</span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
                                            <span className="text-muted-foreground">Method:</span>
                                            {student.paymentMethod === 'OFFLINE' ? (
                                                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300">
                                                    Offline (Academy)
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                    UPI QR
                                                </Badge>
                                            )}
                                        </div>
                                        {student.utrNumber && (
                                            <div className="flex items-center gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5">
                                                <Hash className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-muted-foreground">UTR:</span>
                                                <span className="font-mono font-medium text-blue-700 dark:text-blue-300">
                                                    {student.utrNumber}
                                                </span>
                                            </div>
                                        )}
                                        {student.paymentScreenshotAt && (
                                            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
                                                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-muted-foreground">Uploaded:</span>
                                                <span className="font-medium">
                                                    {formatDate(student.paymentScreenshotAt)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Screenshot (collapsible) */}
                                    {isExpanded && student.paymentScreenshotUrl && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Payment Screenshot
                                            </p>
                                            <div
                                                className="relative cursor-pointer rounded-lg border bg-muted/50 p-2 transition-colors hover:bg-muted"
                                                onClick={() => setExpandedImage(student.id)}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={student.paymentScreenshotUrl}
                                                    alt={`Payment screenshot from ${student.fullName}`}
                                                    className="mx-auto max-h-64 rounded-md object-contain"
                                                />
                                                <p className="mt-1 text-center text-xs text-muted-foreground">
                                                    Click to view full size
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Offline note when expanded */}
                                    {isExpanded && !student.paymentScreenshotUrl && (
                                        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4 text-center text-sm text-muted-foreground">
                                            <p className="font-medium text-amber-800 dark:text-amber-300">Offline Payment Mode</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                The student chose to pay at the academy. Verify with front desk staff before approving.
                                            </p>
                                        </div>
                                    )}

                                    {/* Show thumbnail link when collapsed */}
                                    {!isExpanded && student.paymentScreenshotUrl && (
                                        <div
                                            className="flex cursor-pointer items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            onClick={() => toggleCard(student.id)}
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                            <span>View payment screenshot</span>
                                        </div>
                                    )}

                                    {!isExpanded && !student.paymentScreenshotUrl && (
                                        <p className="text-xs text-muted-foreground italic">
                                            Offline payment — no screenshot attached
                                        </p>
                                    )}

                                    {/* Reject Reason Textarea */}
                                    {isRejecting && (
                                        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                            <label className="text-sm font-medium text-destructive">
                                                Rejection Reason (optional)
                                            </label>
                                            <Textarea
                                                value={rejectNote}
                                                onChange={(e) => setRejectNote(e.target.value)}
                                                placeholder="Enter reason for rejection..."
                                                className="resize-none"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleReject(student.id)}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                    )}
                                                    Confirm Rejection
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setRejectingId(null)
                                                        setRejectNote('')
                                                    }}
                                                    disabled={isProcessing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {!isRejecting && (
                                        <div className="flex items-center gap-2 border-t pt-4">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(student.id)}
                                                disabled={isProcessing}
                                                className="gap-2 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                                Approve Payment
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setRejectingId(student.id)
                                                    setRejectNote('')
                                                }}
                                                disabled={isProcessing}
                                                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Full-size Image Modal */}
            {expandedImage && (() => {
                const student = students.find((s) => s.id === expandedImage)
                if (!student?.paymentScreenshotUrl) return null

                return (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setExpandedImage(null)}
                    >
                        <div className="relative max-h-[90vh] max-w-[90vw]">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -right-2 -top-10 text-white hover:bg-white/20"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExpandedImage(null)
                                }}
                            >
                                <X className="h-5 w-5" />
                                <span className="ml-1">Close</span>
                            </Button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={student.paymentScreenshotUrl}
                                alt={`Payment screenshot from ${student.fullName}`}
                                className="max-h-[85vh] max-w-full rounded-lg object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <p className="mt-2 text-center text-sm text-white/70">
                                {student.fullName} — {student.studentId}
                            </p>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
