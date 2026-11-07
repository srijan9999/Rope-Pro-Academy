"use client"

import Link from "next/link"
import { Trophy, Map, Calendar, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { siteConfig } from "@/lib/site-config"
import { Button } from "@/components/ui/button"

export function KeyAchievements() {
    const achievements = [
        {
            icon: Trophy,
            title: "Global Ambassadors",
            description: "Guinness World Record holders and elite athletes competing on international platforms",
            stats: `${siteConfig.stats.internationalPlayersDisplay}+ International Players`,
        },
        {
            icon: Map,
            title: "National Champions",
            description: "Over 100 national champions emerged from our programs, leading in India",
            stats: "100+ Champions",
        },
        {
            icon: Calendar,
            title: "200+ Events",
            description: "Demonstrations, workshops, and fitness campaigns spreading awareness across schools and communities",
            stats: "Active Community",
        },
    ]

    return (
        <section className="py-20 md:py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
                        Proven Track Record
                    </span>
                    <h2 className="font-heading text-3xl font-bold uppercase text-primary md:text-4xl">
                        Our Legacy of Excellence
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                        Pioneering competitive rope skipping in India since {siteConfig.foundingYear}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 mb-12">
                    {achievements.map((item, index) => (
                        <motion.div
                            key={index}
                            className="relative flex flex-col items-center text-center overflow-hidden rounded-xl bg-background p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:border dark:border-zinc-800"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 font-heading text-xl font-bold uppercase">{item.title}</h3>
                            <p className="mb-6 text-muted-foreground">{item.description}</p>
                            <div className="mt-auto border-t border-border pt-4 w-full">
                                <span className="font-heading text-lg font-bold text-primary">{item.stats}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Link to Dedicated Records / Hall of Fame */}
                <div className="text-center">
                    <Button asChild size="lg" className="bg-primary hover:bg-red-700 text-white font-semibold uppercase tracking-wider text-xs sm:text-sm">
                        <Link href="/achievements" className="inline-flex items-center gap-2">
                            <span>Explore Hall of Fame & Championship Records</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
