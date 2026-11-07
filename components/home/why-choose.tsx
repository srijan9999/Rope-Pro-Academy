import { siteConfig } from "@/lib/site-config"
import { Check } from "lucide-react"

export function WhyChooseSection() {
    return (
        <section
            id="why-choose"
            className="py-20 md:py-28 bg-black text-white border-b border-zinc-800"
            aria-labelledby="why-choose-heading"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Academy Standards
                    </span>
                    <h2
                        id="why-choose-heading"
                        className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight"
                    >
                        Why Choose <span className="text-[#E63946]">Rope Pro</span>?
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-zinc-400">
                        Our structured training programs combine safety, elite coaching standards, and clear competitive pathways for athletes at every stage of their journey.
                    </p>
                </div>

                {/* Clean numbered checklist layout with red accent markers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {siteConfig.whyChoosePoints.map((point, index) => {
                        const numberStr = String(index + 1).padStart(2, "0")
                        return (
                            <div
                                key={index}
                                className="group relative rounded-xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 hover:border-[#E63946]/50 transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="font-heading text-3xl font-extrabold text-zinc-700 group-hover:text-[#E63946] transition-colors">
                                        {numberStr}
                                    </span>
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30">
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                    </div>
                                </div>

                                <h3 className="font-heading text-xl font-bold text-white mb-2 group-hover:text-zinc-100 transition-colors">
                                    {point.title}
                                </h3>

                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {point.description}
                                </p>

                                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2">
                                    <span className="h-1 w-6 bg-[#E63946] rounded-full" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                        Verified RPA Standard
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
