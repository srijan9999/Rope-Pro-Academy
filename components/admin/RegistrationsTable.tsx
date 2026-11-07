"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { formatINR, labelFor, SCHOOLS, PLANS } from "@/lib/pricing"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    CheckCircle2,
    XCircle,
    Copy,
    Check,
    Search,
    Clock,
    AlertCircle,
    Loader2,
    Building2,
    Filter,
} from "lucide-react"

export interface RegistrationRow {
    id: string
    fullName: string
    studentId: string
    school: string | null
    selectedPlan: string | null
    feeAmount: number | null
    utrNumber: string | null
    paymentSubmittedAt: string | null
    paymentReviewedAt: string | null
    paymentRejectionNote: string | null
    status: string
    createdAt: string
    userEmail: string | null
}

interface RegistrationsTableProps {
    initialRegistrations: RegistrationRow[]
}

type TabKey = "PENDING_VERIFICATION" | "PENDING_PAYMENT" | "ACTIVE" | "PAYMENT_REJECTED" | "ALL"

export default function RegistrationsTable({ initialRegistrations }: RegistrationsTableProps) {
    const router = useRouter()
    const [registrations, setRegistrations] = useState<RegistrationRow[]>(initialRegistrations)
    const [selectedTab, setSelectedTab] = useState<TabKey>("PENDING_VERIFICATION")
    const [searchQuery, setSearchQuery] = useState("")

    // Copy status tracking per row
    const [copiedUtr, setCopiedUtr] = useState<string | null>(null)

    // Approve dialog state
    const [approveTarget, setApproveTarget] = useState<RegistrationRow | null>(null)
    const [approving, setApproving] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    // Reject dialog state
    const [rejectTarget, setRejectTarget] = useState<RegistrationRow | null>(null)
    const [rejectReason, setRejectReason] = useState("")
    const [rejecting, setRejecting] = useState(false)

    // Copy to clipboard helper
    const handleCopyUtr = async (utr: string) => {
        try {
            await navigator.clipboard.writeText(utr)
            setCopiedUtr(utr)
            setTimeout(() => setCopiedUtr(null), 2000)
        } catch {
            // fallback
        }
    }

    // Tab counts
    const counts = useMemo(() => {
        const res = {
            PENDING_VERIFICATION: 0,
            PENDING_PAYMENT: 0,
            ACTIVE: 0,
            PAYMENT_REJECTED: 0,
            ALL: registrations.length,
        }
        for (const r of registrations) {
            if (r.status === "PENDING_VERIFICATION") res.PENDING_VERIFICATION++
            else if (r.status === "PENDING_PAYMENT") res.PENDING_PAYMENT++
            else if (r.status === "ACTIVE") res.ACTIVE++
            else if (r.status === "PAYMENT_REJECTED") res.PAYMENT_REJECTED++
        }
        return res
    }, [registrations])

    // Filter and sort items
    const filteredRegistrations = useMemo(() => {
        let list = registrations

        // 1. Status Filter
        if (selectedTab !== "ALL") {
            list = list.filter((r) => r.status === selectedTab)
        }

        // 2. Search Query
        const q = searchQuery.trim().toLowerCase()
        if (q) {
            list = list.filter(
                (r) =>
                    r.fullName.toLowerCase().includes(q) ||
                    (r.userEmail && r.userEmail.toLowerCase().includes(q)) ||
                    (r.utrNumber && r.utrNumber.toLowerCase().includes(q)) ||
                    r.studentId.toLowerCase().includes(q)
            )
        }

        // 3. Sorting: Pending verification oldest first; others newest first
        return [...list].sort((a, b) => {
            if (selectedTab === "PENDING_VERIFICATION") {
                const dateA = a.paymentSubmittedAt ? new Date(a.paymentSubmittedAt).getTime() : 0
                const dateB = b.paymentSubmittedAt ? new Date(b.paymentSubmittedAt).getTime() : 0
                return dateA - dateB
            } else {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return dateB - dateA
            }
        })
    }, [registrations, selectedTab, searchQuery])

    // Approve API handler
    const handleConfirmApprove = async () => {
        if (!approveTarget) return
        setApproving(true)
        setActionError(null)

        try {
            const res = await fetch(`/api/admin/registrations/${approveTarget.id}/approve`, {
                method: "PATCH",
            })
            const data = await res.json()

            if (!res.ok) {
                setActionError(data.message || "Failed to approve registration.")
                return
            }

            // Optimistically update local row
            setRegistrations((prev) =>
                prev.map((r) =>
                    r.id === approveTarget.id
                        ? {
                              ...r,
                              status: "ACTIVE",
                              paymentReviewedAt: new Date().toISOString(),
                          }
                        : r
                )
            )

            setApproveTarget(null)
            router.refresh()
        } catch {
            setActionError("Network error. Please try again.")
        } finally {
            setApproving(false)
        }
    }

    // Reject API handler
    const handleConfirmReject = async () => {
        if (!rejectTarget || !rejectReason.trim()) return
        setRejecting(true)
        setActionError(null)

        try {
            const res = await fetch(`/api/admin/registrations/${rejectTarget.id}/reject`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: rejectReason.trim() }),
            })
            const data = await res.json()

            if (!res.ok) {
                setActionError(data.message || "Failed to reject registration.")
                return
            }

            // Optimistically update local row
            setRegistrations((prev) =>
                prev.map((r) =>
                    r.id === rejectTarget.id
                        ? {
                              ...r,
                              status: "PAYMENT_REJECTED",
                              paymentRejectionNote: rejectReason.trim(),
                              paymentReviewedAt: new Date().toISOString(),
                          }
                        : r
                )
            )

            setRejectTarget(null)
            setRejectReason("")
            router.refresh()
        } catch {
            setActionError("Network error. Please try again.")
        } finally {
            setRejecting(false)
        }
    }

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING_VERIFICATION":
                return (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        Pending Verification
                    </Badge>
                )
            case "ACTIVE":
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                    </Badge>
                )
            case "PAYMENT_REJECTED":
                return (
                    <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold gap-1 text-[11px]">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </Badge>
                )
            case "PENDING_PAYMENT":
            default:
                return (
                    <Badge variant="outline" className="text-zinc-500 border-zinc-300 dark:border-zinc-700 font-semibold text-[11px]">
                        Pending Payment
                    </Badge>
                )
        }
    }

    const formatDate = (iso: string | null) => {
        if (!iso) return "—"
        const d = new Date(iso)
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="space-y-6">
            {/* Filter Tabs & Search Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setSelectedTab("PENDING_VERIFICATION")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedTab === "PENDING_VERIFICATION"
                                ? "bg-white dark:bg-zinc-950 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Pending Verification
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            counts.PENDING_VERIFICATION > 0
                                ? "bg-amber-500 text-white"
                                : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                        }`}>
                            {counts.PENDING_VERIFICATION}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab("PENDING_PAYMENT")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedTab === "PENDING_PAYMENT"
                                ? "bg-white dark:bg-zinc-950 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Pending Payment
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-muted-foreground">
                            {counts.PENDING_PAYMENT}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab("ACTIVE")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedTab === "ACTIVE"
                                ? "bg-white dark:bg-zinc-950 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Active
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-muted-foreground">
                            {counts.ACTIVE}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab("PAYMENT_REJECTED")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedTab === "PAYMENT_REJECTED"
                                ? "bg-white dark:bg-zinc-950 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Rejected
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-muted-foreground">
                            {counts.PAYMENT_REJECTED}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedTab === "ALL"
                                ? "bg-white dark:bg-zinc-950 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        All
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-muted-foreground">
                            {counts.ALL}
                        </span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search athlete, email, UTR..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-background"
                    />
                </div>
            </div>

            {/* Registrations Table Container */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableRow className="border-zinc-200 dark:border-zinc-800">
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">Athlete</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">Centre</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">Plan</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">Amount</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">12-Digit UTR</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">Submitted At</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5">Status</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Filter className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                                            <p className="text-sm font-medium">No registrations found in this view.</p>
                                            <p className="text-xs text-zinc-400">
                                                {searchQuery
                                                    ? "Try clearing your search query or switching tabs."
                                                    : "New registrations will appear here automatically."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRegistrations.map((r) => {
                                    const schoolDisplay = r.school ? labelFor(SCHOOLS, r.school) : "—"
                                    const planDisplay = r.selectedPlan ? labelFor(PLANS, r.selectedPlan) : "—"
                                    const amountDisplay = r.feeAmount ? formatINR(r.feeAmount) : "—"
                                    const canAct = r.status === "PENDING_VERIFICATION"

                                    return (
                                        <TableRow
                                            key={r.id}
                                            className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                                        >
                                            {/* Athlete Column */}
                                            <TableCell className="py-4">
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-sm text-foreground block">
                                                        {r.fullName}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-mono text-[11px]">{r.studentId}</span>
                                                        {r.userEmail && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[150px]">{r.userEmail}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Centre */}
                                            <TableCell className="py-4 font-medium text-xs text-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <span>{schoolDisplay}</span>
                                                </div>
                                            </TableCell>

                                            {/* Plan */}
                                            <TableCell className="py-4 text-xs font-semibold text-foreground">
                                                {planDisplay}
                                            </TableCell>

                                            {/* Amount */}
                                            <TableCell className="py-4">
                                                <span className="text-sm font-black font-heading text-[#E63946]">
                                                    {amountDisplay}
                                                </span>
                                            </TableCell>

                                            {/* UTR with 1-click copy */}
                                            <TableCell className="py-4">
                                                {r.utrNumber ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-semibold">
                                                        <span>{r.utrNumber}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyUtr(r.utrNumber!)}
                                                            title="Copy UTR to clipboard"
                                                            className="p-1 hover:text-[#E63946] transition-colors rounded"
                                                        >
                                                            {copiedUtr === r.utrNumber ? (
                                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs font-mono">—</span>
                                                )}
                                            </TableCell>

                                            {/* Submitted At */}
                                            <TableCell className="py-4 text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(r.paymentSubmittedAt)}
                                            </TableCell>

                                            {/* Status Badge */}
                                            <TableCell className="py-4">
                                                {renderStatusBadge(r.status)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-4 text-right">
                                                {canAct ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setActionError(null)
                                                                setApproveTarget(r)
                                                            }}
                                                            className="h-8 px-2.5 text-xs font-bold text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/50"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setActionError(null)
                                                                setRejectReason("")
                                                                setRejectTarget(r)
                                                            }}
                                                            className="h-8 px-2.5 text-xs font-bold text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* APPROVE CONFIRMATION DIALOG */}
            <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Confirm Payment & Approve Athlete
                        </DialogTitle>
                        <DialogDescription className="text-xs pt-1">
                            Please verify that this payment matches your bank statement before approving.
                        </DialogDescription>
                    </DialogHeader>

                    {approveTarget && (
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Athlete:</span>
                                <span className="font-bold">{approveTarget.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Centre:</span>
                                <span className="font-semibold">
                                    {approveTarget.school ? labelFor(SCHOOLS, approveTarget.school) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-semibold">
                                    {approveTarget.selectedPlan ? labelFor(PLANS, approveTarget.selectedPlan) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800">
                                <span className="text-muted-foreground font-semibold">Amount to verify:</span>
                                <span className="font-black text-sm text-[#E63946]">
                                    {approveTarget.feeAmount ? formatINR(approveTarget.feeAmount) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-semibold">Submitted UTR:</span>
                                <span className="font-mono font-bold text-foreground">
                                    {approveTarget.utrNumber || "—"}
                                </span>
                            </div>
                        </div>
                    )}

                    {actionError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{actionError}</span>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setApproveTarget(null)}
                            disabled={approving}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmApprove}
                            disabled={approving}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                        >
                            {approving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                "Yes, Confirm & Activate"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* REJECT CONFIRMATION DIALOG */}
            <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600">
                            <XCircle className="w-5 h-5" />
                            Reject Payment Submission
                        </DialogTitle>
                        <DialogDescription className="text-xs pt-1">
                            The student will see this rejection note on their payment page and can verify their bank reference to resubmit.
                        </DialogDescription>
                    </DialogHeader>

                    {rejectTarget && (
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Athlete:</span>
                                    <span className="font-bold">{rejectTarget.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Submitted UTR:</span>
                                    <span className="font-mono">{rejectTarget.utrNumber || "—"}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="rejectReason" className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Reason for Rejection *
                                </label>
                                <Textarea
                                    id="rejectReason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g. UTR not found on bank statement, or payment amount did not match."
                                    className="text-xs resize-none h-24"
                                />
                            </div>
                        </div>
                    )}

                    {actionError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{actionError}</span>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRejectTarget(null)}
                            disabled={rejecting}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmReject}
                            disabled={rejecting || !rejectReason.trim()}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                        >
                            {rejecting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                "Confirm Rejection"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
