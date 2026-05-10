"use client"

import Link from "next/link"
import { COACHES } from "@/lib/data"
import { Button } from "@/components/ui/button"

export function CoachesPreview() {
    // Show top 2 coaches for the "Meet Our Trainers" preview as per mockup
    const featuredCoaches = COACHES.slice(0, 2)

    return (
        <section className="py-20 md:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white md:text-5xl">
                        Meet Our <span className="text-primary">Trainers</span>
                    </h2>
                    <div className="mx-auto mt-4 h-1 w-24 bg-red-100">
                        <div className="h-full w-8 bg-primary"></div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-12 lg:gap-24">
                    {featuredCoaches.map((coach, index) => (
                        <div key={index} className="relative group w-full max-w-md">
                            {/* Background Shapes */}
                            <div className="absolute inset-0 translate-x-4 translate-y-4 transform -skew-x-12 bg-zinc-200 dark:bg-zinc-800" />
                            <div className="absolute inset-0 -translate-x-2 -translate-y-2 transform -skew-x-12 border-2 border-primary" />

                            {/* Main Card Content */}
                            <div className="relative flex h-[400px] w-full transform -skew-x-12 items-end overflow-hidden bg-black shadow-2xl transition-transform hover:-translate-y-2">
                                {/* Coach Image Background */}
                                <div className="absolute inset-0 bg-zinc-800 skew-x-12 scale-125">
                                    <div className="h-full w-full bg-zinc-700 flex items-center justify-center text-zinc-500">
                                        {/* Placeholder for Image */}
                                        <span className="text-4xl font-bold opacity-20">{coach.name}</span>
                                    </div>
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </div>

                                {/* Text Content Box */}
                                <div className="relative z-10 w-full translate-x-6 skew-x-12 p-8">
                                    <div className="inline-block bg-black px-6 py-3 border-l-4 border-primary shadow-lg">
                                        <h3 className="font-heading text-2xl font-bold uppercase text-white">{coach.name}</h3>
                                        <p className="text-sm font-bold uppercase tracking-wider text-primary">{coach.role}</p>
                                    </div>
                                </div>

                                {/* Red Accent Bar */}
                                <div className="absolute right-0 top-0 h-full w-16 -skew-x-12 bg-primary/10" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coach Recruitment CTA */}
                <div className="mt-16 mx-auto max-w-2xl text-center">
                    <div className="rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-8 sm:p-10 transition-all hover:border-red-400 dark:hover:border-red-700">
                        <h3 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                            Join Our Coaching Team
                        </h3>
                        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
                            Are you an experienced rope skipping professional? Apply to become a coach at Rope Pro Academy and train the next generation of champions.
                        </p>
                        <div className="mt-6">
                            <Button asChild size="lg" className="bg-primary hover:bg-red-700 text-white font-bold uppercase px-8">
                                <Link href="/register/coach">
                                    Apply Now →
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
