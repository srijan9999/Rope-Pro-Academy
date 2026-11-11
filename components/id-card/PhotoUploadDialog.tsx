"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadDropzone } from "@/lib/uploadthing"
import { Loader2, Camera, CheckCircle2, AlertCircle } from "lucide-react"

export interface PhotoUploadDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (photoUrl: string) => void
    targetUserId?: string
}

export function PhotoUploadDialog({
    isOpen,
    onClose,
    onSuccess,
    targetUserId,
}: PhotoUploadDialogProps) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleUploadComplete = async (res: Array<{ key: string; ufsUrl?: string; url?: string }>) => {
        const file = res?.[0]
        if (!file?.key) {
            setError("No file received from upload service.")
            return
        }

        setSaving(true)
        setError(null)
        try {
            const apiRes = await fetch("/api/user/photo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    photoKey: file.key,
                    targetUserId,
                }),
            })

            const data = await apiRes.json()
            if (!apiRes.ok || !data.success) {
                throw new Error(data.message || "Failed to update profile photo")
            }

            setSuccessMessage("Photo uploaded and saved successfully!")
            setTimeout(() => {
                onSuccess(data.photoUrl)
                onClose()
            }, 800)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save photo"
            setError(msg)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                        <Camera className="w-5 h-5 text-[#E63946]" />
                        Update ID Card Photo
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Upload a front-facing passport style portrait (JPG, PNG, WebP up to 4 MB).
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="py-2">
                    {saving ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="w-8 h-8 text-[#E63946] animate-spin" />
                            <p className="text-xs font-semibold text-zinc-600">
                                Saving photo to your profile...
                            </p>
                        </div>
                    ) : (
                        <UploadDropzone
                            endpoint="profilePhoto"
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={(err: Error) => {
                                setError(err.message || "Upload failed")
                            }}
                            className="border-dashed border-2 border-zinc-300 dark:border-zinc-700 ut-label:text-xs ut-allowed-content:text-[10px]"
                        />
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={saving}
                        className="text-xs"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
