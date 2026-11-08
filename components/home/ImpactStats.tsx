"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import { siteConfig } from "@/lib/site-config"
import { Users, Globe, Calendar } from "lucide-react"

export function ImpactStats() {
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, margin: "-100px" })
    const prefersReducedMotion = useReducedMotion()

    // Default to final numbers for SSR / static render
    const [studentsCount, setStudentsCount] = useState<number>(siteConfig.stats.studentsTrained)
    const [playersCount, setPlayersCount] = useState<number>(siteConfig.stats.internationalPlayers)
    const hasAnimatedRef = useRef(false)

    useEffect(() => {
        if (!isInView || prefersReducedMotion || hasAnimatedRef.current) return
        hasAnimatedRef.current = true

        const duration = 2000 // 2 seconds
        const startTime = performance.now()

        const targetStudents = siteConfig.stats.studentsTrained
        const targetPlayers = siteConfig.stats.internationalPlayers

        let animId: number

        function step(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic curve
            const easeOut = 1 - Math.pow(1 - progress, 3)

            setStudentsCount(Math.floor(easeOut * targetStudents))
            setPlayersCount(Math.floor(easeOut * targetPlayers))

            if (progress < 1) {
                animId = requestAnimationFrame(step)
            } else {
                setStudentsCount(targetStudents)
                setPlayersCount(targetPlayers)
            }
        }

        animId = requestAnimationFrame(step)
        return () => cancelAnimationFrame(animId)
    }, [isInView, prefersReducedMotion])

    return (
        <section
            ref={containerRef}
            aria-label="Academy Impact Statistics"
            className="relative bg-black border-y border-zinc-800 text-white py-14 overflow-hidden"
        >
            {/* Red accent glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#E63946] to-transparent opacity-80" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                    {/* Stat 1: Students Trained */}
                    <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] mb-4">
                            <Users className="w-7 h-7" />
                        </div>
                        <div className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                            <span>{studentsCount}</span>
                            <span className="text-[#E63946]">+</span>
                        </div>
                        <p className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-zinc-400">
                            Students Trained
                        </p>
                    </div>

                    {/* Stat 2: International Players */}
                    <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] mb-4">
                            <Globe className="w-7 h-7" />
                        </div>
                        <div className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                            <span>{playersCount}</span>
                        </div>
                        <p className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-zinc-400">
                            International Players
                        </p>
                    </div>

                    {/* Stat 3: Founding Year (Static, no count-up) */}
                    <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] mb-4">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <div className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                            <span>{siteConfig.stats.foundingYear}</span>
                        </div>
                        <p className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-zinc-400">
                            Founding Year
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
