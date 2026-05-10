import { FounderProfile } from "@/components/about/founder-profile"
import { MilestonesTimeline } from "@/components/about/milestone-timeline"
import { SITE_CONFIG } from "@/lib/data"

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Image and Text */}
            <div className="relative h-[400px] w-full bg-black">
                <div className="absolute inset-0 bg-zinc-900 opacity-50">
                    {/* Placeholder for Hero Image */}
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
                    <h1 className="font-heading text-5xl font-black uppercase md:text-7xl">About Us</h1>
                    <div className="mt-4 h-1 w-24 bg-primary"></div>
                </div>
            </div>

            {/* Who We Are? */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="mb-6 font-heading text-3xl font-bold uppercase text-zinc-900 dark:text-white">Who We Are?</h2>
                <div className="mx-auto max-w-4xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                    <p>{SITE_CONFIG.description}</p>
                    <p className="mt-4">
                        Founded in {SITE_CONFIG.founded} by {SITE_CONFIG.founder}, Rope Pro Academy has grown from a small group of enthusiasts to a premier institution producing national and international champions.
                    </p>
                </div>
            </div>

            {/* Vision & Mission */}
            <section className="bg-zinc-50 py-16 dark:bg-zinc-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:flex-row md:justify-center">
                    <div className="flex-1 rounded-none border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 font-heading text-2xl font-bold uppercase text-primary">Our Vision</h2>
                        <p className="text-zinc-600 dark:text-zinc-300">{SITE_CONFIG.vision}</p>
                    </div>
                    <div className="flex-1 rounded-none border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 font-heading text-2xl font-bold uppercase text-primary">Our Mission</h2>
                        <p className="text-zinc-600 dark:text-zinc-300">{SITE_CONFIG.description}</p>
                    </div>
                </div>
            </section>

            {/* About Leadership */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="font-heading text-3xl font-bold uppercase text-zinc-900 dark:text-white">About Leadership</h2>
                        <div className="mx-auto mt-4 h-1 w-24 bg-primary"></div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {/* Leader 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 h-64 w-full max-w-[300px] bg-zinc-200 dark:bg-zinc-800">
                                {/* Photo Placeholder */}
                            </div>
                            <h3 className="text-xl font-bold uppercase">{SITE_CONFIG.founder}</h3>
                            <p className="text-sm font-medium text-primary">Founder & Head Coach</p>
                        </div>
                        {/* Leader 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 h-64 w-full max-w-[300px] bg-zinc-200 dark:bg-zinc-800">
                                {/* Photo Placeholder */}
                            </div>
                            <h3 className="text-xl font-bold uppercase">Senior Coach</h3>
                            <p className="text-sm font-medium text-primary">Technical Director</p>
                        </div>
                        {/* Leader 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 h-64 w-full max-w-[300px] bg-zinc-200 dark:bg-zinc-800">
                                {/* Photo Placeholder */}
                            </div>
                            <h3 className="text-xl font-bold uppercase">Management</h3>
                            <p className="text-sm font-medium text-primary">Operations Head</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Keep existing components if needed or remove them. The user asked for structure change. 
                I'll keep them commented out or remove them to strictly follow wireframe. 
                The wireframe doesn't show timeline, so I will omit MilestonesTimeline for now to match exactly. 
            */}
        </div>
    )
}
