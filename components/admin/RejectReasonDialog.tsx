'use client'

import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RejectReasonDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (reason: string) => void
    isLoading?: boolean
}

export function RejectReasonDialog({
    open,
    onOpenChange,
    onConfirm,
    isLoading = false
}: RejectReasonDialogProps) {
    const [reason, setReason] = useState('')

    const handleConfirm = () => {
        onConfirm(reason)
        setReason('')
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reject Request</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please provide a reason for rejecting this request. This will be sent to the requester.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Label htmlFor="reason">Rejection Reason</Label>
                    <Textarea
                        id="reason"
                        placeholder="Enter the reason for rejection..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="mt-2"
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading || reason.trim().length < 5}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? 'Rejecting...' : 'Reject Request'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
