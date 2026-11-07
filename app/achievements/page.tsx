import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { ChampionsDirectory } from "@/components/records/ChampionsDirectory"
import PhotoGallery, { type GalleryPhoto } from "@/components/PhotoGallery"

export const metadata = {
    title: "Hall of Fame & Championship Records | Rope Pro Academy",
    description: "Explore our International and National championship records, podium finishes, and verified tournament achievements.",
}

// Section 2.1: dynamic rendering ensures new uploads in Admin appear immediately without redeployment
export const dynamic = "force-dynamic"

export default async function AchievementsPage() {
    const media = await prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            url: true,
            year: true,
            title: true,
        },
    })

    const photos: GalleryPhoto[] = media.map((m) => ({
        id: String(m.id),
        url: m.url,
        year: m.year == null ? null : String(m.year),
        label: m.title ?? undefined,
    }))

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header Hero */}
            <div className="bg-zinc-950 py-16 sm:py-20 text-center border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Legacy of Excellence
                    </span>
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl text-white">
                        Hall of <span className="text-[#E63946]">Fame</span>
                    </h1>
                    <p className="mt-4 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto">
                        Official competition records, podium finishes, and global tournament achievements across international and national platforms.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
                {/* 1. Official Championship Records Section */}
                <section aria-label="Official championship records">
                    <Suspense
                        fallback={
                            <div className="py-20 text-center text-zinc-500">
                                Loading championship records...
                            </div>
                        }
                    >
                        <ChampionsDirectory />
                    </Suspense>
                </section>

                {/* 2. Public Photo Gallery Section */}
                <section
                    id="photo-gallery"
                    aria-label="Hall of Fame photo gallery"
                    className="pt-16 border-t border-zinc-800/80"
                >
                    <div className="mb-10 text-center sm:text-left">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-2">
                            Moments & Medals
                        </span>
                        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                            Championship <span className="text-[#E63946]">Photo Gallery</span>
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl">
                            Moments and achievements from our athletes, year by year.
                        </p>
                    </div>

                    <PhotoGallery photos={photos} />
                </section>
            </div>
        </div>
    )
}
