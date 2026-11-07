"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function AchievementsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Hall of Fame Error:", error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-black px-4 py-16 text-white">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-center justify-center mx-auto mb-4 text-[#E63946]">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">
                    Could not load Hall of Fame
                </h2>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    We encountered an issue while loading tournament records and photos. Please try again.
                </p>
                <button
                    type="button"
                    onClick={() => reset()}
                    suppressHydrationWarning
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E63946] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 shadow-lg shadow-[#E63946]/30"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                </button>
            </div>
        </div>
    )
}
