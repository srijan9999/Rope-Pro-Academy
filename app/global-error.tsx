"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Safe diagnostic logging: log digest only, no sensitive values
        if (error?.digest) {
            console.error(`[Global Error] Digest: ${error.digest}`)
        }
    }, [error])

    return (
        <html lang="en">
            <body className="bg-black text-white antialiased">
                <div className="min-h-screen flex items-center justify-center px-4 py-16">
                    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-center justify-center mx-auto mb-4 text-[#E63946]">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">
                            Application Error
                        </h2>
                        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                            A critical error occurred while rendering the page. Please reload or try again.
                        </p>
                        {error?.digest && (
                            <div className="mt-4 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5">
                                <span className="font-mono text-[11px] text-zinc-400">
                                    Reference ID: <span className="text-zinc-200 select-all">{error.digest}</span>
                                </span>
                            </div>
                        )}
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E63946] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 shadow-lg shadow-[#E63946]/30"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
