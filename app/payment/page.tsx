import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatINR, labelFor, SCHOOLS, PLANS } from "@/lib/pricing"
import UtrForm from "@/components/payment/UtrForm"
import CopyUpiId from "@/components/payment/CopyUpiId"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { AlertCircle, QrCode, Smartphone, Info } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PaymentPage({
    searchParams,
}: {
    searchParams: Promise<{ userId?: string }>
}) {
    const { userId } = await searchParams

    if (!userId) {
        redirect("/register")
    }

    // STRICT SELECT: Never select email, phone, or address on this unauthenticated page
    const s = await prisma.student.findUnique({
        where: { id: userId },
        select: {
            id: true,
            school: true,
            selectedPlan: true,
            feeAmount: true,
            status: true,
            paymentRejectionNote: true,
        },
    })

    if (!s) {
        redirect("/register")
    }

    if (s.status === "PENDING_VERIFICATION") {
        redirect("/payment/success")
    }

    if (s.status === "ACTIVE") {
        redirect("/login")
    }

    const schoolLabel = s.school ? labelFor(SCHOOLS, s.school) : "Selected Centre"
    const planLabel = s.selectedPlan ? labelFor(PLANS, s.selectedPlan) : "Selected Plan"
    const formattedAmount = formatINR(s.feeAmount ?? 0)
    const upiId = process.env.NEXT_PUBLIC_ACADEMY_UPI_ID

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946]">
                        Rope Pro Academy
                    </span>
                    <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                        Complete Payment
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pay your subscription fee to activate your athlete membership.
                    </p>
                </div>

                {/* Rejection Alert (if previously rejected by admin) */}
                {s.status === "PAYMENT_REJECTED" && (
                    <div
                        role="alert"
                        className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm space-y-1.5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-xs text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            Previous Payment Not Verified
                        </div>
                        <p className="text-xs leading-relaxed">
                            <strong>Reason:</strong> {s.paymentRejectionNote || "Invalid or unverified UTR."}
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                            Please check your bank statement or UPI app, verify the 12-digit UTR, and resubmit below.
                        </p>
                    </div>
                )}

                {/* Payment Card */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
                    <CardHeader className="bg-zinc-900 text-white p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            <span>{schoolLabel}</span>
                            <span>{planLabel}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                                Total Fee Payable
                            </span>
                            <div className="text-3xl sm:text-4xl font-black text-[#E63946] font-heading tracking-tight">
                                {formattedAmount}
                            </div>
                        </div>
                        <p className="text-xs text-zinc-300">
                            Pay exactly this amount. A different amount may delay your approval.
                        </p>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* Primary Instruction Line */}
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                Please scan the QR code below to pay{" "}
                                <strong className="text-[#E63946] font-bold">{formattedAmount}</strong>
                            </p>
                        </div>

                        {/* Static QR Code Container (padded white background for scannability) */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 shadow-sm inline-block max-w-[280px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/qr-code.png"
                                    alt="UPI QR code to pay Rope Pro Academy (Ravi Paswan)"
                                    width={260}
                                    height={370}
                                    className="w-full h-auto block mx-auto rounded-lg object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground text-center">
                                <QrCode className="w-3.5 h-3.5 text-[#E63946]" />
                                <span>Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app</span>
                            </div>
                        </div>

                        {/* Optional Copyable UPI ID */}
                        {upiId && <CopyUpiId upiId={upiId} />}

                        {/* Mobile Help Guidance */}
                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-muted-foreground flex items-start gap-2.5">
                            <Smartphone className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>On your phone?</strong> Take a screenshot of this QR and open it from your UPI app&apos;s gallery/photo option to pay directly.
                            </p>
                        </div>

                        <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                        {/* UTR Form Component */}
                        <UtrForm userId={s.id} />

                        {/* Collapsible Help: Where to find UTR */}
                        <Accordion type="single" collapsible className="w-full pt-1">
                            <AccordionItem value="utr-help" className="border-zinc-200 dark:border-zinc-800">
                                <AccordionTrigger className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2">
                                    <span className="flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5 text-[#E63946]" />
                                        Where do I find the 12-digit UTR?
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground space-y-2 pt-1 leading-relaxed">
                                    <p>
                                        After completing the payment in your UPI app, open the payment receipt or transaction details:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                                        <li><strong>Google Pay:</strong> Look for <em>&ldquo;UPI transaction ID&rdquo;</em> (12 digits starting with numbers like 4xxx...)</li>
                                        <li><strong>PhonePe:</strong> Look for <em>&ldquo;UTR&rdquo;</em> under Debited from section</li>
                                        <li><strong>Paytm:</strong> Look for <em>&ldquo;UPI Ref No.&rdquo;</em> in transaction details</li>
                                        <li><strong>BHIM / Bank Apps:</strong> Look for <em>&ldquo;12-digit Reference ID / UTR&rdquo;</em></li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
