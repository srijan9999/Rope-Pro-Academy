import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PricingSection } from "@/components/programs/PricingSection"
import { SchoolProgrammes } from "@/components/programs/SchoolProgrammes"

export const metadata = {
    title: "Programs & Pricing | Rope Pro Academy",
    description: "Explore our training tracks, membership plans, and institutional school programmes.",
}

export default function ProgramsPage() {
    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="bg-zinc-950 py-20 text-center text-white border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Academy Training & Plans
                    </span>
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl">Programs & Classes</h1>
                    <p className="mt-4 text-xl text-zinc-400">Structured Training from Basics to Elite Competition</p>
                </div>
            </div>

            {/* Pricing Section */}
            <PricingSection />

            {/* School Programmes Section */}
            <SchoolProgrammes />

            {/* Trial Class Consultation Banner */}
            <section className="bg-zinc-950 py-16 md:py-20 border-t border-zinc-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 text-center md:p-12">
                        <h2 className="font-heading text-3xl font-bold uppercase md:text-4xl">Not sure which program is right?</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                            Book a free trial class and our coaches will assess your skill level to recommend the perfect batch for you.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Button size="lg" variant="secondary" className="bg-white text-black hover:bg-zinc-200" asChild>
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                            <Button size="lg" className="bg-primary hover:bg-red-700 text-white" asChild>
                                <Link href="/register/player">Book Free Trial</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
