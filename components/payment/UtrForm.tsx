"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

interface UtrFormProps {
    userId: string
}

export default function UtrForm({ userId }: UtrFormProps) {
    const router = useRouter()
    const [utr, setUtr] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const isValidUtr = /^\d{12}$/.test(utr)

    const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip any non-digit characters and limit to 12
        const raw = e.target.value.replace(/\D/g, "").slice(0, 12)
        setUtr(raw)
        if (errorMsg) setErrorMsg(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValidUtr || submitting) return

        setSubmitting(true)
        setErrorMsg(null)

        try {
            const res = await fetch("/api/payment/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    utrNumber: utr,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setErrorMsg(data.message || "Failed to submit payment reference. Please check and try again.")
                return
            }

            // On success, redirect to success confirmation page
            router.push("/payment/success")
        } catch {
            setErrorMsg("Network error. Please check your connection and try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="utrNumber" className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Enter 12-Digit UTR / Transaction ID
                    </Label>
                    <span
                        className={`text-xs font-mono font-semibold ${
                            utr.length === 12
                                ? "text-green-600 dark:text-green-400"
                                : "text-muted-foreground"
                        }`}
                    >
                        {utr.length}/12
                    </span>
                </div>

                <div className="relative">
                    <Input
                        id="utrNumber"
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        value={utr}
                        onChange={handleUtrChange}
                        placeholder="e.g. 402812345678"
                        autoComplete="off"
                        className="font-mono text-base tracking-widest px-4 py-2.5 h-12 border-zinc-300 dark:border-zinc-800 focus:border-[#E63946] focus:ring-[#E63946]"
                    />
                    {isValidUtr && (
                        <CheckCircle2 className="absolute right-3.5 top-3.5 w-5 h-5 text-green-600 dark:text-green-400 pointer-events-none" />
                    )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter the 12-digit <strong>UPI Ref No / UTR</strong> shown in your payment app&apos;s transaction receipt.
                    <span className="block text-[11px] text-zinc-500 mt-0.5">
                        (Do not enter the app-specific internal order or transaction ID; make sure it is the 12-digit numerical UTR).
                    </span>
                </p>
            </div>

            {errorMsg && (
                <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2.5"
                >
                    <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                    <div className="flex-1 leading-snug">{errorMsg}</div>
                </div>
            )}

            <Button
                type="submit"
                disabled={!isValidUtr || submitting}
                className="w-full h-12 bg-[#E63946] hover:bg-[#d0303d] text-white font-bold uppercase tracking-wider text-sm transition-all shadow-md shadow-[#E63946]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Payment Details"
                )}
            </Button>
        </form>
    )
}
