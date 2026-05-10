'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertTriangle } from 'lucide-react'

interface RequestReplacementDialogProps {
    open: boolean
    onClose: () => void
    studentId: string
}

export function RequestReplacementDialog({ open, onClose }: RequestReplacementDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        request_type: '',
        reason: '',
        urgency: 'NORMAL',
        last_seen_location: '',
        police_report_filed: false,
        police_report_number: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.request_type || !formData.reason) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/player/id-card/request-replacement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await res.json()
            if (result.success) {
                setSubmitted(true)
            } else {
                alert(result.error?.message || 'Failed to submit request')
            }
        } catch {
            alert('Failed to submit. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setSubmitted(false)
        setFormData({
            request_type: '',
            reason: '',
            urgency: 'NORMAL',
            last_seen_location: '',
            police_report_filed: false,
            police_report_number: '',
        })
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        Request Replacement Card
                    </DialogTitle>
                    <DialogDescription>
                        Submit a request for a new ID card if yours is lost, stolen, or damaged.
                    </DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                            Request Submitted!
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Your replacement request has been submitted and is pending admin review. You will be notified once it&apos;s processed.
                        </p>
                        <Button onClick={handleClose}>Close</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Request Type */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Reason for Replacement <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.request_type}
                                onValueChange={(v) => setFormData((prev) => ({ ...prev, request_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="REPLACEMENT_LOST">Lost Card</SelectItem>
                                    <SelectItem value="REPLACEMENT_DAMAGED">Damaged Card</SelectItem>
                                    <SelectItem value="REPLACEMENT_STOLEN">Stolen Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Details <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Describe what happened..."
                                value={formData.reason}
                                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        {/* Urgency */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Urgency</Label>
                            <Select
                                value={formData.urgency}
                                onValueChange={(v) => setFormData((prev) => ({ ...prev, urgency: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Last Seen Location */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Last Seen Location</Label>
                            <Input
                                placeholder="Where did you last have it?"
                                value={formData.last_seen_location}
                                onChange={(e) => setFormData((prev) => ({ ...prev, last_seen_location: e.target.value }))}
                            />
                        </div>

                        {/* Fee Notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Replacement cards may incur a fee of ₹100–₹200 depending on the reason.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting || !formData.request_type || !formData.reason}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
