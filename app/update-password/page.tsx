"use client"

import { useState, type FormEvent } from "react"
import { useSession, signOut } from "next-auth/react"
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react"
import { updatePasswordSchema } from "@/lib/validations/password"
import { getRoleHome } from "@/lib/auth-routes"

export default function UpdatePasswordPage() {
    const { data: session, update } = useSession()
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [show, setShow] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)

        // Client-side validation check
        const parsed = updatePasswordSchema.safeParse({ newPassword, confirmPassword })
        if (!parsed.success) {
            setError(parsed.error.issues[0].message)
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/user/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword, confirmPassword }),
            })
            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data.message ?? "Could not update password. Please try again.")
                return
            }

            // Refresh the JWT session. NextAuth fires the jwt callback with trigger "update".
            // The callback re-reads mustChangePassword directly from the database.
            const home = getRoleHome(session?.user?.role)
            await update({ passwordChanged: true })

            // Hard navigation ensures the browser presents fresh cookies and avoids client-side router cache
            window.location.assign(home)
        } catch {
            setError("Network error. Please check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    const inputClass =
        "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 pr-10 text-sm text-foreground focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/30"

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="mb-6 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-center justify-center shrink-0">
                        <ShieldAlert className="h-5 w-5 text-[#E63946]" aria-hidden />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
                            Set a New Password
                        </h1>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            You signed in with a temporary system password. Choose a secure personal password to activate your account.
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="newPassword" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            New Password *
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={show ? "text" : "password"}
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={inputClass}
                                aria-describedby="password-rules"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShow((s) => !s)}
                                className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                                aria-label={show ? "Hide passwords" : "Show passwords"}
                            >
                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p id="password-rules" className="mt-1.5 text-[11px] text-muted-foreground">
                            At least 8 characters, including uppercase, lowercase, and a number.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Confirm New Password *
                        </label>
                        <input
                            id="confirmPassword"
                            type={show ? "text" : "password"}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-[#E63946]/30"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mt-5 w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                    Sign out
                </button>
            </div>
        </main>
    )
}
