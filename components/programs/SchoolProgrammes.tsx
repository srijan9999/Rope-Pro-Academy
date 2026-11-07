import Link from "next/link"
import { PARTNER_SCHOOLS } from "@/content/pricing"
import { Button } from "@/components/ui/button"
import { School, Award, Sparkles, Trophy, ArrowRight, CheckCircle2 } from "lucide-react"

export function SchoolProgrammes() {
    return (
        <section
            id="school-programmes"
            aria-labelledby="schools-heading"
            className="py-16 md:py-24 bg-black text-white border-t border-zinc-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Institutional Partnerships
                    </span>
                    <h2
                        id="schools-heading"
                        className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
                    >
                        School <span className="text-[#E63946]">Programmes</span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-zinc-400">
                        Bringing championship-level rope skipping curricula, demonstration events, and competitive coaching directly into schools and educational institutions.
                    </p>
                </div>

                {/* 3 Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* Pillar 1: In-School Coaching */}
                    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-8 flex flex-col justify-between hover:border-[#E63946]/40 transition-colors">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mb-6">
                                <School className="w-6 h-6" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold uppercase text-white mb-3">
                                In-School Coaching
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Structured rope skipping sessions integrated directly into the physical education schedule or after-school sports academy hours, tailored for students from elementary to senior secondary.
                            </p>
                        </div>
                        <ul className="mt-6 pt-4 border-t border-zinc-900 space-y-2 text-xs text-zinc-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#E63946]" /> Age-appropriate stamina & motor skills
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#E63946]" /> Certified coaches stationed on campus
                            </li>
                        </ul>
                    </div>

                    {/* Pillar 2: Demonstrations & Workshops */}
                    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-8 flex flex-col justify-between hover:border-[#E63946]/40 transition-colors">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold uppercase text-white mb-3">
                                Demos & Workshops
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Electrifying rope skipping showcases performed by Guinness World Record holders and international athletes, paired with hands-on introductory clinics to inspire student participation.
                            </p>
                        </div>
                        <ul className="mt-6 pt-4 border-t border-zinc-900 space-y-2 text-xs text-zinc-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#E63946]" /> Annual day & sports day guest showcases
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#E63946]" /> Interactive weekend skill masterclasses
                            </li>
                        </ul>
                    </div>

                    {/* Pillar 3: Competition Preparation */}
                    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-8 flex flex-col justify-between hover:border-[#E63946]/40 transition-colors">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mb-6">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold uppercase text-white mb-3">
                                Tournament Training
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Rigorous training camp setups designed to prepare school squads for inter-school meets, CBSE Nationals, Delhi Olympic Games, and School Games Federation of India (SGFI) tournaments.
                            </p>
                        </div>
                        <ul className="mt-6 pt-4 border-t border-zinc-900 space-y-2 text-xs text-zinc-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#E63946]" /> Speed timer benchmarking & choreography
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#E63946]" /> Official tournament rulebook preparation
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Partner Schools Showcase */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-8 sm:p-10 mb-12">
                    <div className="text-center sm:text-left mb-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E63946]">
                            Proven Academic Track Record
                        </span>
                        <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mt-1">
                            Partner & Associated Schools
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                            Schools and educational campuses that have partnered with Rope Pro Academy for coaching clinics, sports events, and competitive squad development:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {PARTNER_SCHOOLS.map((school, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200"
                            >
                                <Award className="w-4 h-4 text-[#E63946] shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">{school}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-[11px] text-zinc-500 mt-6 italic text-center sm:text-left">
                        * Programme formats, schedules, and fee structures are customized according to each school&apos;s campus infrastructure and student cohort size.
                    </p>
                </div>

                {/* Institutional CTA */}
                <div className="text-center max-w-2xl mx-auto rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-8">
                    <h3 className="font-heading text-2xl font-bold uppercase text-white mb-3">
                        Introduce Rope Skipping to Your Campus
                    </h3>
                    <p className="text-sm text-zinc-400 mb-6">
                        Customized proposals, demonstration requests, and structured school sports tie-ups are handled directly by our academy leadership.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-[#E63946] hover:bg-red-700 text-white font-semibold uppercase tracking-wider text-xs sm:text-sm px-8"
                        >
                            <Link href="/contact?type=school">
                                Enquire for your school
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs sm:text-sm"
                        >
                            <a href="mailto:info@roproacademy.com?subject=School%20Programme%20Enquiry%20-%20Rope%20Pro%20Academy">
                                Email Academy Directly
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
