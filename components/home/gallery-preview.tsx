"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function GalleryPreview() {
    return (
        <section className="py-20 md:py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white md:text-5xl">
                        Our <span className="text-primary">Gallery</span>
                    </h2>
                    <div className="mx-auto mt-4 h-1 w-24 bg-red-100">
                        <div className="h-full w-4 bg-primary mx-auto"></div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                            {/* Placeholder Image */}
                            <div className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 flex items-center justify-center text-zinc-400">
                                [Gallery Image {i}]
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button size="lg" className="h-12 skew-x-[-12deg] bg-primary px-8 text-base font-bold uppercase hover:bg-red-700" asChild>
                        <Link href="/gallery">
                            <span className="skew-x-[12deg] inline-block">View More Images</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
