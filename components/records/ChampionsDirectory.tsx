"use client"

import { useState, useRef, useEffect } from "react"
import {
    CHAMPION_RECORDS,
    ChampionCategory,
    RecordYear,
    filterChampions,
} from "@/content/champions"
import { Trophy, Medal, ChevronDown, Calendar, Sparkles, CheckCircle2 } from "lucide-react"

export function ChampionsDirectory() {
    const [selectedCategory, setSelectedCategory] = useState<ChampionCategory>("international")
    const [selectedYear, setSelectedYear] = useState<RecordYear | "ALL">("ALL")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Inline pills: ALL, 2026, 2025, 2024. Dropdown: 2023, 2022.
    const inlineYears: RecordYear[] = [2026, 2025, 2024]
    const dropdownYears: RecordYear[] = [2023, 2022]

    const isDropdownYearSelected =
        selectedYear !== "ALL" && dropdownYears.includes(selectedYear as RecordYear)

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredRecords = filterChampions(CHAMPION_RECORDS, selectedCategory, selectedYear)

    return (
        <section aria-labelledby="records-heading" className="w-full">
            <h2 id="records-heading" className="sr-only">
                Championship Records Directory
            </h2>

            {/* Top-Level Tabs: International Champions vs National Champions */}
            <div className="flex justify-center mb-10">
                <div
                    role="tablist"
                    aria-label="Championship Category"
                    className="inline-flex p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner"
                >
                    <button
                        role="tab"
                        id="tab-international"
                        suppressHydrationWarning
                        aria-selected={selectedCategory === "international"}
                        aria-controls="panel-champions"
                        onClick={() => setSelectedCategory("international")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] ${
                            selectedCategory === "international"
                                ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/30"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        <span>International Champions</span>
                    </button>

                    <button
                        role="tab"
                        id="tab-national"
                        suppressHydrationWarning
                        aria-selected={selectedCategory === "national"}
                        aria-controls="panel-champions"
                        onClick={() => setSelectedCategory("national")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] ${
                            selectedCategory === "national"
                                ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/30"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                        }`}
                    >
                        <Medal className="w-4 h-4" />
                        <span>National Champions</span>
                    </button>
                </div>
            </div>

            {/* Year Filters: Inline Pills (All, 2026, 2025, 2024) + "View More ▾" Dropdown (2023, 2022) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-500 mr-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E63946]" /> Year:
                </span>

                {/* 'All' Pill */}
                <button
                    onClick={() => setSelectedYear("ALL")}
                    suppressHydrationWarning
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        selectedYear === "ALL"
                            ? "bg-white text-black shadow-sm font-black"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                >
                    All Years
                </button>

                {/* Inline Years: 2026, 2025, 2024 */}
                {inlineYears.map((yr) => {
                    const isSelected = selectedYear === yr
                    return (
                        <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            suppressHydrationWarning
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                isSelected
                                    ? "bg-white text-black shadow-sm font-black"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                            }`}
                        >
                            {yr}
                        </button>
                    )
                })}

                {/* View More Dropdown (2023, 2022) */}
                <div className="relative inline-block" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        aria-expanded={isDropdownOpen}
                        suppressHydrationWarning
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                            isDropdownYearSelected
                                ? "bg-white text-black border-white shadow-sm font-black"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        }`}
                    >
                        <span>{isDropdownYearSelected ? `Year: ${selectedYear}` : "View More"}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-36 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl py-1 z-30">
                            {dropdownYears.map((yr) => (
                                <button
                                    key={yr}
                                    type="button"
                                    suppressHydrationWarning
                                    onClick={() => {
                                        setSelectedYear(yr)
                                        setIsDropdownOpen(false)
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                                        selectedYear === yr
                                            ? "bg-[#E63946] text-white font-bold"
                                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                    }`}
                                >
                                    {yr} Season
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Records Grid */}
            <div
                id="panel-champions"
                role="tabpanel"
                aria-labelledby={`tab-${selectedCategory}`}
                className="transition-opacity duration-300"
            >
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-16 px-6 rounded-2xl border border-zinc-800 bg-zinc-950 max-w-xl mx-auto">
                        <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-base font-bold uppercase text-white">
                            No Records Found for {selectedYear === "ALL" ? "This Category" : `${selectedYear}`}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1.5">
                            Competition records for this season are being updated as official tournament results are finalized.
                        </p>
                        {selectedYear !== "ALL" && (
                            <button
                                onClick={() => setSelectedYear("ALL")}
                                suppressHydrationWarning
                                className="mt-4 text-xs font-bold uppercase tracking-wider text-[#E63946] hover:underline"
                            >
                                View all years
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRecords.map((record) => (
                            <div
                                key={record.id}
                                className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-7 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/60 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E63946]/5 rounded-bl-full pointer-events-none group-hover:bg-[#E63946]/10 transition-colors" />

                                <div>
                                    {/* Header badge & Year */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-[11px] font-black uppercase tracking-wider">
                                            {record.medalOrRank}
                                        </span>
                                        <span className="text-xs font-extrabold text-zinc-400">
                                            {record.year}
                                        </span>
                                    </div>

                                    {/* Athlete Name / Title */}
                                    <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-1 group-hover:text-[#E63946] transition-colors">
                                        {record.athleteName ? record.athleteName : record.title}
                                    </h3>

                                    {record.athleteName && (
                                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                            {record.title}
                                        </p>
                                    )}

                                    {/* Event & Discipline */}
                                    <div className="py-3 my-3 border-y border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                                        <div>
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider">Event:</span>{" "}
                                            <span className="font-medium">{record.event}</span>
                                        </div>
                                        {record.discipline && (
                                            <div>
                                                <span className="text-zinc-500 font-bold uppercase tracking-wider">Discipline:</span>{" "}
                                                <span className="font-medium">{record.discipline}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {record.notes && (
                                        <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                                            {record.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 pt-3 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E63946]" />
                                    <span>Verified Academy Record</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
