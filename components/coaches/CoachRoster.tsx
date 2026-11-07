"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import {
    COACH_PROFILES,
    COACH_FILTER_TABS,
    CoachFilter,
    filterCoaches,
} from "@/content/coaches"
import { Trophy, Award, Globe, UserCheck, Quote } from "lucide-react"

export function CoachRoster() {
    const searchParams = useSearchParams()

    // Determine filter from query param: ?filter=guinness | international | limca | professional
    const urlFilter = searchParams.get("filter") as CoachFilter | null
    const validUrlFilter: CoachFilter | null =
        urlFilter && ["professional", "guinness", "international", "limca"].includes(urlFilter)
            ? urlFilter
            : null

    const [filterState, setFilterState] = useState<CoachFilter | null>(null)
    const activeFilter: CoachFilter = filterState ?? (validUrlFilter || "professional")
    const tabListRef = useRef<HTMLDivElement>(null)

    const handleSelectFilter = (filterId: CoachFilter) => {
        setFilterState(filterId)
        // Update URL query string without full reload
        const params = new URLSearchParams(window.location.search)
        if (filterId === "professional") {
            params.delete("filter")
        } else {
            params.set("filter", filterId)
        }
        const query = params.toString()
        const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
        window.history.replaceState(null, "", newUrl)
    }

    // Keyboard navigation for tablist (ArrowLeft / ArrowRight)
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "ArrowRight") {
            e.preventDefault()
            const nextIndex = (index + 1) % COACH_FILTER_TABS.length
            const nextTab = COACH_FILTER_TABS[nextIndex].id
            handleSelectFilter(nextTab)
            const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
            buttons?.[nextIndex]?.focus()
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            const prevIndex = (index - 1 + COACH_FILTER_TABS.length) % COACH_FILTER_TABS.length
            const prevTab = COACH_FILTER_TABS[prevIndex].id
            handleSelectFilter(prevTab)
            const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
            buttons?.[prevIndex]?.focus()
        }
    }

    // Calculate count per filter
    const getTabCount = (tabId: CoachFilter) => {
        return filterCoaches(COACH_PROFILES, tabId).length
    }

    const filteredCoaches = filterCoaches(COACH_PROFILES, activeFilter)

    return (
        <section aria-labelledby="roster-heading" className="w-full">
            <h2 id="roster-heading" className="sr-only">
                Coach Roster and Filter Categories
            </h2>

            {/* Filter Tabs Header */}
            <div className="flex justify-center mb-10 sm:mb-12">
                <div
                    ref={tabListRef}
                    role="tablist"
                    aria-label="Coach Categories"
                    className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner max-w-full"
                >
                    {COACH_FILTER_TABS.map((tab, idx) => {
                        const isSelected = activeFilter === tab.id
                        const count = getTabCount(tab.id)

                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                id={`tab-${tab.id}`}
                                aria-selected={isSelected}
                                aria-controls={`panel-${tab.id}`}
                                tabIndex={isSelected ? 0 : -1}
                                onClick={() => handleSelectFilter(tab.id)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                suppressHydrationWarning
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] ${
                                    isSelected
                                        ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/30"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        isSelected
                                            ? "bg-white/20 text-white"
                                            : "bg-zinc-800 text-zinc-400"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Coach Cards Grid */}
            <div
                id={`panel-${activeFilter}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeFilter}`}
                className="transition-opacity duration-300"
            >
                {filteredCoaches.length === 0 ? (
                    <div className="text-center py-16 px-4 rounded-2xl border border-zinc-800 bg-zinc-950">
                        <UserCheck className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold uppercase text-white">No Coaches in this Category</h3>
                        <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                            Check back soon as our team and certifications continue to expand.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCoaches.map((coach) => (
                            <div
                                key={coach.id}
                                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-sm transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/50 group"
                            >
                                <div>
                                    {/* Coach Photo / Initials Header */}
                                    <div className="relative aspect-[4/3] bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800">
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                                        
                                        {/* Stylized Initial or Photo */}
                                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl font-black text-zinc-400 group-hover:scale-105 group-hover:border-[#E63946] transition-all duration-300">
                                            {coach.name.charAt(0)}
                                        </div>

                                        {/* Distinction Badges Top-Right */}
                                        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 items-end">
                                            {coach.isGuinnessHolder && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#E63946] text-white text-[10px] font-black uppercase tracking-wider shadow">
                                                    <Trophy className="w-3 h-3" /> Guinness Record
                                                </span>
                                            )}
                                            {coach.isLimcaHolder && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow">
                                                    <Award className="w-3 h-3" /> Limca Record
                                                </span>
                                            )}
                                            {coach.isInternationalPlayer && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                                                    <Globe className="w-3 h-3" /> International
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Coach Info (Note: 'coach specs' top badge bar removed) */}
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-white group-hover:text-[#E63946] transition-colors">
                                                {coach.name}
                                            </h3>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
                                                {coach.role}
                                            </p>
                                        </div>

                                        {/* Achievements List */}
                                        <div className="mt-4 pt-4 border-t border-zinc-800">
                                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946] block mb-2.5">
                                                Career Achievements
                                            </span>
                                            <ul className="space-y-1.5 text-xs text-zinc-300">
                                                {coach.achievements.map((ach, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] shrink-0 mt-1.5" />
                                                        <span className="leading-snug">{ach}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Coaching Philosophy / Bio */}
                                        {coach.bio && (
                                            <div className="mt-5 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                                                <Quote className="w-3.5 h-3.5 text-[#E63946] mb-1 opacity-70" />
                                                <p className="text-xs text-zinc-400 italic leading-relaxed">
                                                    &ldquo;{coach.bio}&rdquo;
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 pt-0 mt-auto">
                                    <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                                        Specialization: <span className="text-zinc-300">{coach.specialization}</span> • Experience: <span className="text-zinc-300">{coach.experience}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
