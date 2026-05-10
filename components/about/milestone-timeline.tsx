"use client"

import { MILESTONES } from "@/lib/data"
import { motion } from "framer-motion"

export function MilestonesTimeline() {
    return (
        <section className="py-20">
            <div className="container">
                <div className="mb-16 text-center">
                    <span className="font-heading text-lg font-bold uppercase text-primary">Our Journey</span>
                    <h2 className="mt-2 font-heading text-3xl font-bold uppercase md:text-4xl">History & Milestones</h2>
                </div>

                <div className="relative mx-auto max-w-4xl border-l-2 border-zinc-200 pl-8 ml-4 md:ml-auto md:pl-0 md:border-l-0 dark:border-zinc-800">
                    {/* Center line for desktop */}
                    <div className="absolute left-1/2 hidden h-full w-0.5 -translate-x-1/2 bg-zinc-200 md:block dark:bg-zinc-800" />

                    {MILESTONES.map((item, index) => (
                        <motion.div
                            key={index}
                            className={`relative mb-12 md:flex ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center justify-between`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Dot */}
                            <div className="absolute -left-[41px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary md:left-1/2 md:-translate-x-1/2 border-4 border-background shadow-sm z-10">
                            </div>

                            <div className="md:w-[45%]">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <span className="mb-2 block font-heading text-2xl font-bold text-primary">{item.year}</span>
                                    <h3 className="mb-2 font-heading text-lg font-bold uppercase">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
