import Link from "next/link"
import { CheckCircle2, ArrowRight, ShieldCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
    title: "Payment Submitted | Rope Pro Academy",
}

export default function PaymentSuccessPage() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full space-y-8">
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
                    <CardContent className="p-8 text-center space-y-6">
                        {/* Status Icon */}
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/60 border border-green-200 dark:border-green-800 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        {/* Heading & Subtitle */}
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946]">
                                Rope Pro Academy
                            </span>
                            <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                                Success: Pending Admin Approval
                            </h1>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Thank you! Your payment details and 12-digit UTR reference have been recorded.
                            </p>
                        </div>

                        {/* Explanation Box */}
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left space-y-3">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h2 className="text-xs font-bold uppercase text-foreground">
                                        Verification in Progress
                                    </h2>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Our academy administration will cross-reference your submitted UTR against our bank account shortly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h2 className="text-xs font-bold uppercase text-foreground">
                                        Account Activation
                                    </h2>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Once verified, your athlete status will become <strong>Active</strong> and you will be able to log in to access your athlete dashboard and training schedule.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Link */}
                        <div className="pt-2">
                            <Link href="/">
                                <Button className="w-full h-11 bg-[#E63946] hover:bg-[#d0303d] text-white font-bold uppercase tracking-wider text-xs gap-2">
                                    Return to Home
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
