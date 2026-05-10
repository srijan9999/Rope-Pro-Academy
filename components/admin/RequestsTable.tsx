'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Check, X, Eye, Clock, AlertTriangle } from 'lucide-react'
import type { Request } from '@/hooks/useRequests'

interface RequestsTableProps {
    requests: Request[]
    onViewDetails: (request: Request) => void
    onApprove: (request: Request) => void
    onReject: (request: Request) => void
}

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
}

export function RequestsTable({
    requests,
    onViewDetails,
    onApprove,
    onReject
}: RequestsTableProps) {

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, 'destructive' | 'secondary' | 'outline'> = {
            URGENT: 'destructive',
            HIGH: 'destructive',
            MEDIUM: 'secondary',
            LOW: 'outline'
        }

        return (
            <Badge variant={variants[priority] || 'secondary'} className="gap-1">
                {priority === 'URGENT' && <AlertTriangle className="h-3 w-3" />}
                {priority === 'HIGH' && <Clock className="h-3 w-3" />}
                {priority}
            </Badge>
        )
    }

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            LEAVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            MEDICAL_LEAVE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            PROFILE_UPDATE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            ACADEMY_TRANSFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            BATCH_TRANSFER: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
            COMPLAINT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            QUERY: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }

        return (
            <Badge className={colors[type] || colors.QUERY}>
                {type.replace(/_/g, ' ')}
            </Badge>
        )
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No requests to display
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[220px]">Requester</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="max-w-[300px]">Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow
                            key={request.id}
                            className={request.isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={request.requester.profile.photoUrl} />
                                        <AvatarFallback>
                                            {request.requester.profile.fullName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">
                                            {request.requester.profile.fullName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {request.requesterRole} • {request.requester.profile.studentId || request.requester.profile.coachId || ''}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>{getTypeBadge(request.type)}</TableCell>

                            <TableCell>
                                <div className="max-w-[280px]">
                                    <p className="font-medium text-sm truncate">{request.subject}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {request.description}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>{getPriorityBadge(request.priority)}</TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm">
                                        {formatTimeAgo(request.createdAt)}
                                    </span>
                                    {request.isOverdue && (
                                        <span className="text-xs text-destructive font-medium">
                                            Overdue ({request.daysOpen}d)
                                        </span>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    {/* View Details - always visible */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onViewDetails(request)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>

                                    {/* Approve/Reject - only for PENDING or UNDER_REVIEW */}
                                    {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => onApprove(request)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onReject(request)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
