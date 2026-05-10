"use client"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        relative rounded-lg border p-4 shadow-lg
                        animate-in slide-in-from-right-full
                        ${toast.variant === 'destructive'
                            ? 'bg-destructive text-destructive-foreground border-destructive'
                            : 'bg-background text-foreground border-border'
                        }
                    `}
                >
                    <button
                        onClick={() => dismiss(toast.id)}
                        className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {toast.title && (
                        <div className="font-semibold text-sm">{toast.title}</div>
                    )}
                    {toast.description && (
                        <div className="text-sm opacity-90 mt-1">{toast.description}</div>
                    )}
                </div>
            ))}
        </div>
    )
}
