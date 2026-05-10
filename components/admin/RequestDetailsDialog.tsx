'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, FileText, User } from 'lucide-react'
import type { Request } from '@/hooks/useRequests'

interface RequestDetailsDialogProps {
    request: Request | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onApprove: () => void
    onReject: () => void
}

export function RequestDetailsDialog({
    request,
    open,
    onOpenChange,
    onApprove,
    onReject
}: RequestDetailsDialogProps) {
    if (!request) return null

    const renderTypeSpecificData = () => {
        if (!request.data) return null

        switch (request.type) {
            case 'LEAVE':
            case 'MEDICAL_LEAVE':
                return (
                    <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Leave Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2 font-medium">{request.data.leaveType}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Start:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(request.data.startDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">End:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(request.data.endDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {request.data.reason && (
                            <p className="text-sm text-muted-foreground mt-2">
                                <strong>Reason:</strong> {request.data.reason}
                            </p>
                        )}
                        {request.data.supportingDocument && (
                            <div className="mt-4">
                                <span className="text-sm font-medium text-muted-foreground block mb-2">Supporting Document:</span>
                                <div className="border rounded-lg overflow-hidden bg-background max-w-sm">
                                    {/* Handle PDF vs Image */}
                                    {request.data.supportingDocument.startsWith('data:application/pdf') ? (
                                        <div className="p-4 flex items-center justify-center bg-gray-50 h-32">
                                            <a
                                                href={request.data.supportingDocument}
                                                download="document.pdf"
                                                className="flex items-center gap-2 text-blue-600 hover:underline"
                                            >
                                                <FileText className="h-6 w-6" />
                                                Download PDF
                                            </a>
                                        </div>
                                    ) : (
                                        <img
                                            src={request.data.supportingDocument}
                                            alt="Supporting Document"
                                            className="h-48 w-auto rounded-lg border object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 'PROFILE_UPDATE':
                return (
                    <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile Update Details
                        </h4>
                        <div className="text-sm space-y-2">
                            <div>
                                <span className="text-muted-foreground">Field:</span>
                                <span className="ml-2 font-medium">{request.data.fieldName}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Current:</span>
                                <span className="ml-2">{String(request.data.currentValue || '—')}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Requested:</span>
                                <span className="ml-2 font-medium text-primary">
                                    {String(request.data.requestedValue)}
                                </span>
                            </div>
                        </div>
                    </div>
                )

            case 'ACADEMY_TRANSFER':
            case 'BATCH_TRANSFER':
                return (
                    <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium">Transfer Details</h4>
                        <div className="text-sm space-y-2">
                            <div>
                                <span className="text-muted-foreground">Transfer Type:</span>
                                <span className="ml-2 font-medium">{request.data.transferType}</span>
                            </div>
                            {request.data.effectiveDate && (
                                <div>
                                    <span className="text-muted-foreground">Effective Date:</span>
                                    <span className="ml-2">
                                        {new Date(request.data.effectiveDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <Badge>{request.type.replace(/_/g, ' ')}</Badge>
                        <Badge variant={request.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                            {request.priority}
                        </Badge>
                    </div>
                    <DialogTitle className="mt-2">{request.subject}</DialogTitle>
                    <DialogDescription>
                        Submitted {new Date(request.createdAt).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Requester Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={request.requester.profile.photoUrl} />
                            <AvatarFallback>
                                {request.requester.profile.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{request.requester.profile.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                                {request.requesterRole} • {request.requester.email}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {request.description}
                        </p>
                    </div>

                    {/* Type-specific data */}
                    {renderTypeSpecificData()}

                    {/* Attachments */}
                    {request.attachments && request.attachments.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Attachments
                            </h4>
                            <ul className="text-sm text-primary">
                                {request.attachments.map((url: string, idx: number) => (
                                    <li key={idx}>
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                                            Attachment {idx + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        {/* Only show Approve/Reject for PENDING or UNDER_REVIEW */}
                        {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                            <>
                                <Button variant="destructive" onClick={onReject}>
                                    Reject
                                </Button>
                                <Button onClick={onApprove}>
                                    Approve
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
