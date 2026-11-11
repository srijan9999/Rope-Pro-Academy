"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle, Lock } from "lucide-react"

export interface EditCardDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    role?: "STUDENT" | "COACH"
    initialData: {
        idNumber?: string | null
        fullName?: string | null
        gender?: string | null
        dateOfBirth?: string | null
        branchName?: string | null
        email?: string | null
        phone?: string | null
        weightKg?: number | string | null
        heightCm?: number | string | null
        fatherName?: string | null
        fatherPhone?: string | null
        motherName?: string | null
        motherPhone?: string | null
        addressLine1?: string | null
        addressLine2?: string | null
        city?: string | null
        state?: string | null
        postalCode?: string | null
    }
}

export function EditCardDetailsModal({
    isOpen,
    onClose,
    onSuccess,
    role = "STUDENT",
    initialData,
}: EditCardDetailsModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        weightKg: initialData.weightKg ? String(initialData.weightKg) : "",
        heightCm: initialData.heightCm ? String(initialData.heightCm) : "",
        fatherName: initialData.fatherName || "",
        fatherPhone: initialData.fatherPhone || "",
        motherName: initialData.motherName || "",
        motherPhone: initialData.motherPhone || "",
        addressLine1: initialData.addressLine1 || "",
        addressLine2: initialData.addressLine2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postalCode: initialData.postalCode || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const endpoint = role === "STUDENT" ? "/api/player/id-card" : "/api/coach/profile"
            const payload: Record<string, unknown> = {
                weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
                heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
            }

            if (role === "STUDENT") {
                payload.fatherName = form.fatherName.trim() || null
                payload.fatherPhone = form.fatherPhone.trim() || null
                payload.motherName = form.motherName.trim() || null
                payload.motherPhone = form.motherPhone.trim() || null
                payload.addressLine1 = form.addressLine1.trim() || null
                payload.addressLine2 = form.addressLine2.trim() || null
                payload.city = form.city.trim() || null
                payload.state = form.state.trim() || null
                payload.postalCode = form.postalCode.trim() || null
            }

            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || data.error?.message || "Failed to update details")
            }

            setSuccess(true)
            setTimeout(() => {
                onSuccess()
                onClose()
            }, 900)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Update failed"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-wide">
                        Edit ID Card Details
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Update your physical parameters, guardian contact, and residential address appearing on your official ID card.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>ID card details updated successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Read-Only Verified Identity Section */}
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Verified Identity Credentials (Read-Only)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Full Name</span>
                                <span className="font-medium text-foreground">{initialData.fullName || "—"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">ID Number</span>
                                <span className="font-mono font-bold text-foreground">{initialData.idNumber || "—"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Branch / Academy</span>
                                <span className="font-medium text-foreground truncate block">{initialData.branchName || "—"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Gender / DOB</span>
                                <span className="font-medium text-foreground">{initialData.gender || "—"} / {initialData.dateOfBirth || "—"}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 italic pt-1">
                            To correct official identity fields, please contact your academy coach or administration.
                        </p>
                    </div>

                    {/* Physical Metrics */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Physical Attributes
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="weightKg" className="text-xs">Weight (kg)</Label>
                                <Input
                                    id="weightKg"
                                    name="weightKg"
                                    type="number"
                                    step="0.5"
                                    placeholder="e.g. 48"
                                    value={form.weightKg}
                                    onChange={handleChange}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="heightCm" className="text-xs">Height (cm)</Label>
                                <Input
                                    id="heightCm"
                                    name="heightCm"
                                    type="number"
                                    step="1"
                                    placeholder="e.g. 160"
                                    value={form.heightCm}
                                    onChange={handleChange}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Guardian Info */}
                    {role === "STUDENT" && (
                        <>
                            <div className="space-y-2 pt-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Guardian Information
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="fatherName" className="text-xs">Father&apos;s Name</Label>
                                        <Input
                                            id="fatherName"
                                            name="fatherName"
                                            placeholder="Mr. Amit Goel"
                                            value={form.fatherName}
                                            onChange={handleChange}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="fatherPhone" className="text-xs">Father&apos;s Phone No.</Label>
                                        <Input
                                            id="fatherPhone"
                                            name="fatherPhone"
                                            placeholder="9811628002"
                                            value={form.fatherPhone}
                                            onChange={handleChange}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="motherName" className="text-xs">Mother&apos;s Name</Label>
                                        <Input
                                            id="motherName"
                                            name="motherName"
                                            placeholder="Mrs. Vandana Gupta"
                                            value={form.motherName}
                                            onChange={handleChange}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="motherPhone" className="text-xs">Mother&apos;s Phone No.</Label>
                                        <Input
                                            id="motherPhone"
                                            name="motherPhone"
                                            placeholder="9654287966"
                                            value={form.motherPhone}
                                            onChange={handleChange}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Home Address */}
                            <div className="space-y-2 pt-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Residential Address
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <Label htmlFor="addressLine1" className="text-xs">Address Line 1</Label>
                                        <Input
                                            id="addressLine1"
                                            name="addressLine1"
                                            placeholder="A22 Welcome Aprt Rohini Sector 9"
                                            value={form.addressLine1}
                                            onChange={handleChange}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <Label htmlFor="city" className="text-xs">City</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder="Delhi"
                                                value={form.city}
                                                onChange={handleChange}
                                                className="h-9 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state" className="text-xs">State</Label>
                                            <Input
                                                id="state"
                                                name="state"
                                                placeholder="Delhi"
                                                value={form.state}
                                                onChange={handleChange}
                                                className="h-9 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode" className="text-xs">Pincode</Label>
                                            <Input
                                                id="postalCode"
                                                name="postalCode"
                                                placeholder="110085"
                                                value={form.postalCode}
                                                onChange={handleChange}
                                                className="h-9 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs h-9">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#E63946] hover:bg-[#D9232D] text-white font-bold text-xs h-9 gap-1.5">
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save Card Details
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
