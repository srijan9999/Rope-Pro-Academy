"use client"

import { TESTIMONIALS_DATA } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Quote } from "lucide-react"

export function TestimonialsSection() {
    return (
        <section className="py-24 md:py-32 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white md:text-5xl">
                        Winning <span className="text-primary">Reviews</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 lg:gap-12 justify-items-center">
                    {TESTIMONIALS_DATA.map((item, index) => (
                        <div key={index} className="group relative mt-12 rounded-none border bg-white p-8 pt-16 shadow-lg transition-transform hover:-translate-y-1 dark:bg-zinc-900">
                            {/* Top Image */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 overflow-hidden rounded-full border-4 border-white dark:border-zinc-900 shadow-md bg-zinc-200">
                                {/* Placeholder for actual image */}
                                <div className="flex h-full w-full items-center justify-center bg-zinc-300 text-zinc-500 font-bold text-xl">
                                    {item.name.charAt(0)}
                                </div>
                            </div>

                            {/* Quote Icon */}
                            <div className="absolute -top-4 -right-4 flex h-16 w-12 items-center justify-center bg-primary text-white text-2xl font-serif font-bold shadow-md">
                                99
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-bold text-primary">{item.name}</h3>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.role}</p>

                                {/* Stars */}
                                <div className="mt-2 flex justify-center gap-1 text-primary">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                </div>

                                <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
                                    {item.subtext || item.quote}
                                </p>

                                {/* Bottom Accent Triangle */}
                                <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[40px] border-r-[40px] border-b-primary border-r-primary/50 opacity-80"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
