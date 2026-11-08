"use client"

import { useSession } from "next-auth/react"

export function SessionDebug() {
    const { data: session, status } = useSession()

    if (status !== "authenticated" || !session) {
        return null
    }

    return (
        <aside
            aria-label="Session Debug Inspector"
            className="fixed bottom-4 right-4 z-50 max-h-96 max-w-sm overflow-auto rounded bg-black/80 p-4 font-mono text-xs text-green-400 shadow-2xl backdrop-blur-sm border border-green-500/30"
        >
            <div className="mb-2 flex items-center justify-between border-b border-green-500/20 pb-1 text-[10px] uppercase font-bold tracking-wider text-green-300">
                <span>Session Debug</span>
                <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-[9px] text-green-300">
                    {session.user?.role ?? "ACTIVE"}
                </span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(session, null, 2)}
            </pre>
        </aside>
    )
}

export default SessionDebug
