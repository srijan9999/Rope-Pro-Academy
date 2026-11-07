import Link from "next/link"
import { PRICING_PLANS, REGISTRATION_FEE } from "@/content/pricing"
import { Button } from "@/components/ui/button"
import { Check, Info, Sparkles } from "lucide-react"

export function PricingSection() {
    return (
        <section
            id="pricing"
            aria-labelledby="pricing-heading"
            className="py-16 md:py-24 border-t border-zinc-800 bg-zinc-950 text-white"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Membership Tiers
                    </span>
                    <h2
                        id="pricing-heading"
                        className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
                    >
                        Training <span className="text-[#E63946]">Plans & Pricing</span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-zinc-400">
                        Select a training duration that matches your athlete&apos;s goals. All plans include hands-on coaching and structured skill progressions.
                    </p>

                    {/* Notice about separate registration fee */}
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-xs text-zinc-300">
                        <Info className="w-4 h-4 text-[#E63946] shrink-0" />
                        <span>A one-time academy registration fee of ₹{REGISTRATION_FEE} applies upon admission.</span>
                    </div>
                </div>

                {/* 4-Column Grid: 1 col mobile, 2 sm, 4 lg. Equal height cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 items-stretch">
                    {PRICING_PLANS.map((plan) => {
                        return (
                            <div
                                key={plan.id}
                                className={`flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-200 relative bg-zinc-900/90 ${
                                    plan.isBestValue
                                        ? "border-[#E63946] shadow-lg shadow-[#E63946]/20 ring-1 ring-[#E63946]"
                                        : "border-zinc-800 hover:border-zinc-700"
                                }`}
                            >
                                {plan.isBestValue && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#E63946] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                                        <Sparkles className="w-3 h-3" />
                                        Best Value
                                    </div>
                                )}

                                <div>
                                    {/* Plan Title & Duration */}
                                    <div className="mb-4">
                                        <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-white">
                                            {plan.name}
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {plan.description}
                                        </p>
                                    </div>

                                    {/* Price block */}
                                    <div className="py-4 my-2 border-y border-zinc-800/80">
                                        <div className="font-heading text-2xl sm:text-3xl font-extrabold text-[#E63946]">
                                            {plan.priceDisplay}
                                        </div>
                                        <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
                                            {plan.billingPeriod}
                                        </div>
                                        {plan.isPlaceholderPrice && (
                                            <p className="text-[11px] text-zinc-500 mt-1 italic">
                                                *Rates finalized on enrollment
                                            </p>
                                        )}
                                    </div>

                                    {/* Features list */}
                                    <div className="my-6">
                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                                            What&apos;s Included:
                                        </p>
                                        <ul className="space-y-2.5 text-sm">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-zinc-300">
                                                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E63946]/10 text-[#E63946] shrink-0 mt-0.5">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </div>
                                                    <span className="leading-tight text-xs sm:text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <div className="pt-4 border-t border-zinc-800/80 mt-auto">
                                    <Button
                                        asChild
                                        size="lg"
                                        className={`w-full font-semibold uppercase tracking-wider text-xs sm:text-sm h-11 ${
                                            plan.isBestValue
                                                ? "bg-[#E63946] hover:bg-red-700 text-white shadow-md shadow-[#E63946]/30"
                                                : "bg-white text-black hover:bg-zinc-200"
                                        }`}
                                    >
                                        <Link href={`/register/player?plan=${plan.slug}`}>
                                            Enroll Now
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
