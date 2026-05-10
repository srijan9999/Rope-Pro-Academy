'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
// import { useToast } from '@/hooks/use-toast' // Assuming standard shadcn use-toast
import { useStudents } from '@/hooks/useStudents'
import { Loader2 } from 'lucide-react'

// Using the same schema validation logic but adapted for react-hook-form
const formSchema = z.object({
    studentId: z.string().min(1, 'Student is required'),
    amount: z.coerce.number().min(1, 'Amount must be at least ₹1'),
    paymentType: z.enum([
        'MONTHLY_FEE', 'REGISTRATION_FEE', 'EVENT_FEE',
        'COMPETITION_FEE', 'MERCHANDISE', 'OTHER'
    ]),
    status: z.enum(['PENDING', 'PAID']),
    paymentMode: z.enum([
        'CASH', 'ONLINE', 'UPI', 'CREDIT_CARD',
        'DEBIT_CARD', 'BANK_TRANSFER', 'CHEQUE'
    ]).optional(),
    discount: z.coerce.number().min(0).default(0),
    lateFee: z.coerce.number().min(0).default(0),
    transactionId: z.string().optional(),
    monthYear: z.string().optional(),
    notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RecordPaymentDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function RecordPaymentDialog({
    open,
    onClose,
    onSuccess
}: RecordPaymentDialogProps) {
    // const { toast } = useToast() // Commented - checking availability later or assume standard alert for now if hook missing? 
    // Actually usually in components/ui/use-toast. I'll implement simple alert first or try import.

    const { students, isLoading: loadingStudents } = useStudents({ status: 'ACTIVE' })
    const [isPaid, setIsPaid] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            status: 'PENDING',
            discount: 0,
            lateFee: 0,
            notes: '',
            transactionId: '',
            monthYear: '',
        },
    })

    // Watch for net amount calculation
    const amount = form.watch('amount') || 0
    const discount = form.watch('discount') || 0
    const lateFee = form.watch('lateFee') || 0
    const netAmount = Number(amount) - Number(discount) + Number(lateFee)

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/finance/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    generateInvoice: true,
                    sendReceipt: isPaid
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to record payment')
            }

            //   toast({
            //     title: 'Success',
            //     description: result.data.message,
            //   })
            alert('Success: ' + result.data.message) // Fallback

            form.reset()
            onSuccess()
        } catch (error: any) {
            //   toast({
            //     title: 'Error',
            //     description: error.message,
            //     variant: 'destructive',
            //   })
            alert('Error: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const paymentType = form.watch('paymentType')

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Create a new payment record for a student
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Student Selection */}
                            <FormField
                                control={form.control}
                                name="studentId"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Student *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={loadingStudents}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={
                                                        loadingStudents ? 'Loading students...' : 'Select student'
                                                    } />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.id} value={student.id}>
                                                        {student.fullName} ({student.studentId})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Payment Type */}
                            <FormField
                                control={form.control}
                                name="paymentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="MONTHLY_FEE">Monthly Fee</SelectItem>
                                                <SelectItem value="REGISTRATION_FEE">Registration Fee</SelectItem>
                                                <SelectItem value="EVENT_FEE">Event Fee</SelectItem>
                                                <SelectItem value="COMPETITION_FEE">Competition Fee</SelectItem>
                                                <SelectItem value="MERCHANDISE">Merchandise</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Month/Year (for monthly fees) */}
                            {paymentType === 'MONTHLY_FEE' && (
                                <FormField
                                    control={form.control}
                                    name="monthYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Month/Year</FormLabel>
                                            <FormControl>
                                                <Input type="month" defaultValue={currentMonth} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Amount */}
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (₹) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Discount */}
                            <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Late Fee */}
                            <FormField
                                control={form.control}
                                name="lateFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Late Fee (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Net Amount Display */}
                            <div className="col-span-2 p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Net Amount:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ₹{netAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Status Toggle */}
                            <div className="col-span-2 flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <FormLabel>Mark as Paid</FormLabel>
                                    <FormDescription>
                                        Toggle if payment has been received
                                    </FormDescription>
                                </div>
                                <Switch
                                    checked={isPaid}
                                    onCheckedChange={(checked) => {
                                        setIsPaid(checked)
                                        form.setValue('status', checked ? 'PAID' : 'PENDING')
                                    }}
                                />
                            </div>

                            {/* Payment Mode (only if paid) */}
                            {isPaid && (
                                <FormField
                                    control={form.control}
                                    name="paymentMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Mode *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select mode" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="ONLINE">Online</SelectItem>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Transaction ID (only if paid online) */}
                            {isPaid && ['ONLINE', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'].includes(form.watch('paymentMode') || '') && (
                                <FormField
                                    control={form.control}
                                    name="transactionId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="TXN123456789" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Additional notes..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Record Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
