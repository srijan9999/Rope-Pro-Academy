"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
    return (
        <section className="relative overflow-hidden bg-zinc-950 py-24 text-white">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="font-heading text-4xl font-black uppercase leading-tight md:text-5xl lg:text-6xl">
                    Recent Event
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-zinc-300 md:text-lg">
                    Join us and embark on a journey of growth, achievement, and transformation under the guidance of this champion instructor.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" className="h-12 w-40 skew-x-[-12deg] bg-primary text-base font-bold uppercase hover:bg-red-700">
                        <span className="skew-x-[12deg] inline-block">Join Now</span>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 w-40 skew-x-[-12deg] border-white bg-white text-base font-bold uppercase text-black hover:bg-zinc-200">
                        <span className="skew-x-[12deg] inline-block">Explore More</span>
                    </Button>
                </div>

                {/* Competition Banners / Event Photos */}
                <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group relative overflow-hidden rounded-xl border-2 border-white/20 bg-zinc-900 transition-all hover:border-primary/50">
                            <div className="aspect-video w-full bg-zinc-800 opacity-80 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                                {/* Placeholder */}
                                <span className="text-zinc-500">Event Photo {i}</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-left">
                                <p className="font-bold text-white text-sm uppercase">Competitions Banners</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
