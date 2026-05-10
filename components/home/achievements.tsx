"use client"

import { Trophy, Map, Calendar } from "lucide-react"
import { motion } from "framer-motion"

const achievements = [
    {
        icon: Trophy,
        title: "Global Ambassadors",
        description: "7 Guinness World Record holders trained, competing on international platforms",
        stats: "11 International Players"
    },
    {
        icon: Map,
        title: "National Champions",
        description: "over 100 national champions emerged from our programs, leading in India",
        stats: "100+ Champions"
    },
    {
        icon: Calendar,
        title: "200+ Events",
        description: "Demonstrations, workshops, and fitness campaigns spreading awareness",
        stats: "Active Community"
    }
]

export function KeyAchievements() {
    return (
        <section className="py-20 md:py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-heading text-3xl font-bold uppercase text-primary md:text-4xl">Our Legacy of Excellence</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">Pioneering the sport of rope skipping in India since 2010</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
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
            </div>
        </section>
    )
}
