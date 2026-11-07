import { siteConfig } from "@/lib/site-config"
import { Target, Compass } from "lucide-react"

export function MissionVisionSection() {
    return (
        <section
            id="mission-vision"
            className="py-20 md:py-28 bg-zinc-950 text-white border-b border-zinc-800"
            aria-labelledby="mission-vision-heading"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Purpose & Ambition
                    </span>
                    <h2
                        id="mission-vision-heading"
                        className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight"
                    >
                        Mission <span className="text-[#E63946]">&</span> Vision
                    </h2>
                </div>

                {/* Two-column layout on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
                    {/* Mission Column */}
                    <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800 p-8 sm:p-10 flex flex-col justify-between hover:border-[#E63946]/40 transition-colors">
                        <div className="absolute top-0 left-8 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-xl bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30">
                            <Target className="w-6 h-6" />
                        </div>

                        <div className="pt-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#E63946]">
                                Our Driving Purpose
                            </span>
                            <h3 className="font-heading text-2xl sm:text-3xl font-bold mt-2 mb-4 text-white">
                                The Mission
                            </h3>
                            <blockquote className="border-l-2 border-[#E63946] pl-4 text-lg sm:text-xl font-medium text-zinc-100 italic mb-6 leading-relaxed">
                                &ldquo;{siteConfig.mission.headline}&rdquo;
                            </blockquote>
                            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                                {siteConfig.mission.supporting}
                            </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Physical & Mental Athlete Development
                            </span>
                        </div>
                    </div>

                    {/* Vision Column */}
                    <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800 p-8 sm:p-10 flex flex-col justify-between hover:border-[#E63946]/40 transition-colors">
                        <div className="absolute top-0 left-8 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-xl bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30">
                            <Compass className="w-6 h-6" />
                        </div>

                        <div className="pt-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#E63946]">
                                Global Outlook
                            </span>
                            <h3 className="font-heading text-2xl sm:text-3xl font-bold mt-2 mb-4 text-white">
                                The Vision
                            </h3>
                            <blockquote className="border-l-2 border-[#E63946] pl-4 text-lg sm:text-xl font-medium text-zinc-100 italic mb-6 leading-relaxed">
                                &ldquo;{siteConfig.vision}&rdquo;
                            </blockquote>
                            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                                By standardizing competition-grade coaching, fostering youth development, and promoting fitness across all ages, we elevate rope skipping into a world-recognized competitive sport.
                            </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Fitness • Creativity • Community
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
