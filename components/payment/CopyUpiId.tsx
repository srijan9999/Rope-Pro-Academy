"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyUpiIdProps {
    upiId: string
}

export default function CopyUpiId({ upiId }: CopyUpiIdProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(upiId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback if clipboard API is not available
        }
    }

    return (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                    Academy UPI ID
                </span>
                <span className="font-mono font-semibold text-foreground truncate block">
                    {upiId}
                </span>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 shrink-0"
            >
                {copied ? (
                    <>
                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span>Copied</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                    </>
                )}
            </Button>
        </div>
    )
}
