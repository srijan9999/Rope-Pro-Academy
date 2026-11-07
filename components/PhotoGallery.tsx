"use client"

import { useMemo, useRef, useState, type KeyboardEvent } from "react"
import Image from "next/image"
import { Camera, Calendar, ImageOff } from "lucide-react"

export interface GalleryPhoto {
    id: string
    url: string
    year: string | null
    label?: string
}

const ALL = "all"

export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
    const [selected, setSelected] = useState<string>(ALL)
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

    // Distinct years from the data, sorted newest first
    const years = useMemo(() => {
        const set = new Set<string>()
        photos.forEach((p) => {
            if (p.year && p.year.trim()) {
                set.add(p.year.trim())
            }
        })
        return Array.from(set).sort((a, b) => {
            const numA = Number(a)
            const numB = Number(b)
            if (!isNaN(numA) && !isNaN(numB)) {
                return numB - numA
            }
            return b.localeCompare(a)
        })
    }, [photos])

    // Precomputed counts per year
    const counts = useMemo(() => {
        const map: Record<string, number> = { [ALL]: photos.length }
        photos.forEach((p) => {
            if (p.year && p.year.trim()) {
                const yr = p.year.trim()
                map[yr] = (map[yr] ?? 0) + 1
            }
        })
        return map
    }, [photos])

    // Filtered photos based on selected tab
    const filtered = useMemo(() => {
        if (selected === ALL) return photos
        return photos.filter((p) => p.year && p.year.trim() === selected)
    }, [photos, selected])

    const tabs = [ALL, ...years]

    // Keyboard navigation: ArrowRight / ArrowLeft / Home / End
    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const i = tabs.indexOf(selected)
        let next = i
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length
        else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length
        else if (e.key === "Home") next = 0
        else if (e.key === "End") next = tabs.length - 1
        else return

        e.preventDefault()
        setSelected(tabs[next])
        tabRefs.current[next]?.focus()
    }

    // Empty state: No photos in database at all
    if (photos.length === 0) {
        return (
            <div className="text-center py-20 px-6 rounded-3xl border border-zinc-800 bg-zinc-950 max-w-xl mx-auto shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-7 h-7 text-zinc-500" />
                </div>
                <h3 className="font-heading text-lg font-bold uppercase text-white tracking-wide">
                    Hall of Fame Photo Gallery
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Photos are coming soon. Tournament moments, championship ceremonies, and podium highlights will appear here as they are uploaded.
                </p>
            </div>
        )
    }

    return (
        <section aria-label="Hall of Fame photo gallery">
            {/* Year Filter Tablist */}
            <div className="flex items-center gap-2 mb-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-500 mr-2 flex items-center gap-1.5 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-[#E63946]" /> Year:
                </span>
                <div
                    role="tablist"
                    aria-label="Filter photos by year"
                    onKeyDown={onKeyDown}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
                >
                    {tabs.map((t, i) => {
                        const active = t === selected
                        const count = counts[t] ?? 0
                        return (
                            <button
                                key={t}
                                ref={(el) => {
                                    tabRefs.current[i] = el
                                }}
                                role="tab"
                                id={`tab-${t}`}
                                aria-selected={active}
                                aria-controls="gallery-panel"
                                tabIndex={active ? 0 : -1}
                                onClick={() => setSelected(t)}
                                suppressHydrationWarning
                                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                                    active
                                        ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/30 font-black"
                                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                                }`}
                            >
                                {t === ALL ? "All" : t}{" "}
                                <span className="opacity-75 font-mono text-[11px] ml-1">({count})</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Polite screen reader announcement */}
            <p aria-live="polite" className="sr-only">
                Showing {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
            </p>

            {/* Photo Grid Panel */}
            <div
                id="gallery-panel"
                role="tabpanel"
                aria-labelledby={`tab-${selected}`}
                className="transition-opacity duration-200"
            >
                {filtered.length === 0 ? (
                    <div className="text-center py-16 px-6 rounded-2xl border border-zinc-800 bg-zinc-950 max-w-md mx-auto">
                        <ImageOff className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                            No photos for this year yet
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Check back soon or select &ldquo;All&rdquo; to view all championship moments.
                        </p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {filtered.map((p, i) => (
                            <li
                                key={p.id}
                                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40 transition-all duration-300 hover:border-zinc-700 hover:shadow-black/70"
                            >
                                <Image
                                    src={p.url}
                                    alt={p.label || `Rope Pro Academy championship photo${p.year ? ` from ${p.year}` : ""}`}
                                    fill
                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                    priority={i < 3}
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />

                                {/* Subtle gradient overlay and optional label */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                                    {p.label && (
                                        <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide drop-shadow line-clamp-2">
                                            {p.label}
                                        </p>
                                    )}
                                    {p.year && (
                                        <span className="text-[10px] uppercase font-bold text-[#E63946] tracking-wider mt-0.5">
                                            Season {p.year}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
