import { Suspense } from "react"
import { CoachRoster } from "@/components/coaches/CoachRoster"

export const metadata = {
    title: "Our Coaches | Rope Pro Academy",
    description: "Meet our certified rope skipping coaches, Guinness World Record holders, Limca Book record holders, and international competitors.",
}

export default function CoachesPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header Hero */}
            <div className="bg-zinc-950 py-16 sm:py-20 text-center border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        World-Class Mentorship
                    </span>
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl text-white">
                        Our <span className="text-[#E63946]">Coaches</span>
                    </h1>
                    <p className="mt-4 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto">
                        Trained by record holders and global competitors dedicated to transforming athletes of all skill levels.
                    </p>
                </div>
            </div>

            {/* Interactive Coach Roster */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <Suspense
                    fallback={
                        <div className="py-20 text-center text-zinc-500">
                            Loading coaches directory...
                        </div>
                    }
                >
                    <CoachRoster />
                </Suspense>
            </div>
        </div>
    )
}
