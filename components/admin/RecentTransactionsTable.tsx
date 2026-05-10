'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, RefreshCw } from 'lucide-react'
import type { Transaction } from '@/types/finance'

interface RecentTransactionsTableProps {
    transactions: Transaction[]
    onRefresh: () => void
}

export function RecentTransactionsTable({ transactions, onRefresh }: RecentTransactionsTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                {/* Title handled by parent Card but can add toolbar here if needed */}
                <div />
                <Button variant="ghost" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Receipt / Invoice</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No recent transactions
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="font-mono text-xs">
                                        <div>{txn.invoiceNumber}</div>
                                        {txn.receiptNumber && (
                                            <div className="text-muted-foreground">{txn.receiptNumber}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={txn.student.photoUrl || undefined} />
                                                <AvatarFallback>{txn.student.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{txn.student.fullName}</span>
                                                <span className="text-xs text-muted-foreground">{txn.student.studentId}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{txn.paymentType.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {txn.paymentDate
                                            ? new Date(txn.paymentDate).toLocaleDateString()
                                            : <span className="text-muted-foreground">Due: {new Date(txn.dueDate).toLocaleDateString()}</span>
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        ₹{txn.netAmount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            txn.status === 'PAID' ? 'default' : // default in shadcn is primary/black
                                                txn.status === 'PENDING' ? 'secondary' :
                                                    'destructive'
                                        } className={
                                            txn.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' :
                                                txn.status === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                                        }>
                                            {txn.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {txn.receiptUrl && (
                                            <Button size="icon" variant="ghost" asChild>
                                                <a href={txn.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
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
