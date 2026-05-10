'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BellRing } from 'lucide-react'
import type { OverduePayment } from '@/types/finance'

interface OverduePaymentsListProps {
    payments: OverduePayment[]
}

export function OverduePaymentsList({ payments }: OverduePaymentsListProps) {
    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No overdue payments! 🎉
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.student.fullName}</TableCell>
                                    <TableCell>{new Date(p.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-bold text-destructive">₹{p.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">
                                            {p.daysOverdue} days
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" className="h-8">
                                            <BellRing className="h-3 w-3 mr-1" />
                                            Remind
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
