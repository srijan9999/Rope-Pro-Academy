"use client"

import { SITE_CONFIG } from "@/lib/data"
import { motion } from "framer-motion"

export function FounderProfile() {
    return (
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="container">
                <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-200 shadow-2xl dark:bg-zinc-800">
                            {/* Placeholder for Founder Image */}
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                [Mr. Ravi Paswan Photo]
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                <h3 className="font-heading text-2xl font-bold uppercase">{SITE_CONFIG.founder}</h3>
                                <p className="text-sm">Founder & Head Coach</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-6">
                            <span className="font-heading text-lg font-bold uppercase text-primary">The Visionary</span>
                            <h2 className="mt-2 font-heading text-3xl font-bold uppercase md:text-5xl">Building Champions<br />Since {SITE_CONFIG.founded}</h2>
                        </div>

                        <div className="space-y-6 text-muted-foreground md:text-lg">
                            <p>
                                Rope Pro Academy owes its existence and success to the vision and dedication of our esteemed founder,
                                <strong className="text-foreground"> Mr. Ravi Paswan</strong>. His passion for rope skipping sports and his relentless pursuit of excellence have set the foundation for our academy's success.
                            </p>
                            <p>
                                From training 300+ students in local schools to producing record-breaking athletes, the academy has grown into India's premier rope skipping institution.
                            </p>

                            <blockquote className="border-l-4 border-primary pl-6 italic text-foreground">
                                &quot;Rope skipping is not just a sport—it&apos;s a tool for transformation. Our goal is to build physically fit, mentally sharp, and socially responsible human beings.&quot;
                            </blockquote>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
