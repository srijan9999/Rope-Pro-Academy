"use client"

import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Academy } from "@/hooks/useAcademies"

interface DeleteConfirmDialogProps {
    open: boolean
    onClose: () => void
    academy: Academy | null
    onSuccess: () => void
}

export function DeleteConfirmDialog({
    open,
    onClose,
    academy,
    onSuccess,
}: DeleteConfirmDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        if (!academy) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/academies/${academy.id}`, {
                method: 'DELETE',
                headers: {
                    'x-confirm-delete': academy.id, // Confirmation token
                },
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Deletion failed')
            }

            toast({
                title: 'Success',
                description: result.data.message,
            })

            onSuccess()
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            })
        } finally {
            setIsDeleting(false)
        }
    }

    if (!academy) return null

    const hasStudents = academy._count.students > 0
    const hasBatches = academy._count.batches > 0

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className={hasStudents ? "h-5 w-5 text-destructive" : "h-5 w-5 text-yellow-500"} />
                        {hasStudents ? 'Cannot Delete Academy' : 'Delete Academy?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {hasStudents ? (
                            <div className="space-y-2">
                                <p>
                                    This academy has <strong className="text-foreground">{academy._count.students} student(s)</strong>.
                                </p>
                                <p>
                                    You must transfer all students to another academy before deletion.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>
                                    Are you sure you want to delete <strong className="text-foreground">{academy.name}</strong>?
                                </p>
                                <p>
                                    This action cannot be undone.
                                </p>
                                {hasBatches && (
                                    <p className="text-yellow-600">
                                        Note: This will also delete {academy._count.batches} batch(es).
                                    </p>
                                )}
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {!hasStudents && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            variant="destructive"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Academy
                        </Button>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
