'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { Calendar as CalendarIcon, Loader2, FileUp, AlertCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { requestLeaveSchema, type RequestLeaveInput } from '@/lib/validations/request'

interface RequestLeaveDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const PRIORITY_MAP: Record<string, "LOW" | "MEDIUM" | "HIGH" | "URGENT"> = {
    "MEDICAL": "URGENT",
    "EMERGENCY": "URGENT",
    "CASUAL": "LOW",
    "PERSONAL": "MEDIUM",
    "VACATION": "LOW",
    "EDUCATIONAL": "MEDIUM"
}

export function RequestLeaveDialog({ open, onClose, onSuccess }: RequestLeaveDialogProps) {
    const { toast } = useToast()
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<RequestLeaveInput>({
        resolver: zodResolver(requestLeaveSchema),
        defaultValues: {
            leaveType: 'CASUAL',
            priority: 'MEDIUM',
            parentAcknowledged: false,
            // @ts-ignore - Initialize with empty strings to satisfy useForm
            startDate: '',
            // @ts-ignore
            endDate: '',
            reason: ''
        }
    })

    // Watch values for conditional rendering/logic
    const startDate = form.watch('startDate')
    const endDate = form.watch('endDate')
    const leaveType = form.watch('leaveType')
    const fileUrl = form.watch('supportingDocument')

    // Auto-update priority based on leave type
    useEffect(() => {
        if (leaveType && PRIORITY_MAP[leaveType]) {
            form.setValue('priority', PRIORITY_MAP[leaveType])
        }
    }, [leaveType, form])

    // Calculate number of days
    const daysDuration = startDate && endDate
        ? differenceInDays(new Date(endDate), new Date(startDate)) + 1
        : 0

    const onSubmit = async (data: RequestLeaveInput) => {
        try {
            const response = await fetch('/api/player/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: data.leaveType === 'MEDICAL' ? 'MEDICAL_LEAVE' : 'LEAVE',
                    category: 'LEAVE_APPLICATION',
                    subject: `${data.leaveType} Leave Request - ${daysDuration} day${daysDuration > 1 ? 's' : ''}`,
                    description: data.reason,
                    priority: data.priority, // Use selected priority
                    data: {
                        leaveType: data.leaveType,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        reason: data.reason,
                        supportingDocument: data.supportingDocument,
                        daysDuration
                    }
                })
            })

            // 1. Check for specific error statuses FIRST
            if (response.status === 409) {
                toast({
                    title: 'Request Conflict',
                    description: 'You already have a leave request for this period.',
                    variant: 'destructive'
                })
                return
            }

            // 2. Handle other errors safely
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) // Prevent crash if JSON is bad
                throw new Error(errorData.error?.message || 'Failed to submit leave request')
            }

            // 3. Success Path
            toast({
                title: 'Success!',
                description: 'Your leave request has been submitted to the Admin.',
                className: 'bg-green-100 text-green-900 border-green-200',
                duration: 5000
            })

            form.reset()
            onSuccess()

        } catch (error: any) {
            console.error(error)
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit request. Please try again.',
                variant: 'destructive'
            })
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Maximum file size is 2MB',
                variant: 'destructive'
            })
            return
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Invalid File Type',
                description: 'Only JPG, PNG, and PDF files are allowed',
                variant: 'destructive'
            })
            return
        }

        setIsUploading(true)
        try {
            // Convert to Base64 for persistence (Demo purposes only - typical production would use S3)
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                form.setValue('supportingDocument', base64String)

                toast({
                    title: 'Document Attached',
                    description: 'Your supporting document has been attached',
                })
                setIsUploading(false)
            }
            reader.readAsDataURL(file)
            return // Early return as reader handles state update

        } catch (error: any) {
            toast({
                title: 'Upload Failed',
                description: error.message,
                variant: 'destructive'
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        Request Leave
                    </DialogTitle>
                    <DialogDescription>
                        Submit a leave application for your training sessions. Your coach will be notified and admin will review your request.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Leave Type */}
                        <FormField
                            control={form.control}
                            name="leaveType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leave Type *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select leave type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MEDICAL">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500">❤️</span>
                                                    <span>Medical Leave</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="CASUAL">
                                                <div className="flex items-center gap-2">
                                                    <span>☀️</span>
                                                    <span>Casual Leave</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="EMERGENCY">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-orange-500">⚠️</span>
                                                    <span>Emergency</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="PERSONAL">
                                                <div className="flex items-center gap-2">
                                                    <span>👤</span>
                                                    <span>Personal</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="VACATION">
                                                <div className="flex items-center gap-2">
                                                    <span>✈️</span>
                                                    <span>Vacation/Travel</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {leaveType === 'MEDICAL' && 'Medical certificate recommended for leaves longer than 3 days'}
                                        {leaveType === 'EMERGENCY' && 'Emergency leaves are reviewed with high priority'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date Range Picker */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), 'PPP')
                                                        ) : (
                                                            <span>Pick start date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* End Date */}
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), 'PPP')
                                                        ) : (
                                                            <span>Pick end date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    disabled={(date) =>
                                                        date < new Date() ||
                                                        (startDate && date < new Date(startDate))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Duration Display */}
                        {daysDuration > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className="font-medium">
                                        Leave Duration: {daysDuration} day{daysDuration > 1 ? 's' : ''}
                                    </span>
                                </div>
                                {daysDuration > 7 && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        ⚠️ Leaves longer than 7 days may require additional approval
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Reason */}
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for Leave *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please provide a detailed reason for your leave request. Be specific about why you need time off from training."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {field.value?.length || 0} / 500 characters (minimum 20 required)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />




                        {/* Priority Selection */}
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Auto-adjusted based on leave type, but you can override.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Supporting Document Upload */}
                        <FormField
                            control={form.control}
                            name="supportingDocument"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supporting Document (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                    className="hidden"
                                                    id="document-upload"
                                                />
                                                <label
                                                    htmlFor="document-upload"
                                                    className={cn(
                                                        'flex-1 flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors',
                                                        isUploading && 'opacity-50 cursor-not-allowed'
                                                    )}
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileUp className="h-4 w-4" />
                                                            <span>Upload Document</span>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                            {field.value && (
                                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                                    <span className="text-sm text-green-700">✓ Document attached</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => field.onChange(undefined)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Upload medical certificate or other supporting documents (Max 5MB - JPG, PNG, PDF)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Parent Acknowledgment (for minors) */}
                        <FormField
                            control={form.control}
                            name="parentAcknowledged"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Parent/Guardian Acknowledgment
                                        </FormLabel>
                                        <FormDescription>
                                            I confirm that my parent/guardian is aware of this leave request
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Info Alert */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Important Information</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Leave requests should be submitted at least 24 hours in advance</li>
                                        <li>Emergency leaves can be submitted on the same day</li>
                                        <li>You will receive an email notification once your request is reviewed</li>
                                        <li>Approved leaves will be reflected on your attendance calendar</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={form.formState.isSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Leave Request'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
