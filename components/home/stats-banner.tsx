"use client"

import { GLOBAL_RECOGNITION } from "@/lib/data"
import { Trophy, Book, BookOpen, Medal, Globe, Users, Calendar, UserCheck } from "lucide-react"

const iconMap = {
    Trophy, Book, BookOpen, Medal, Globe, Users, Calendar, UserCheck
}

export function StatsBanner() {
    return (
        <section className="bg-primary py-12 text-white">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="grid grid-cols-2 gap-8 place-items-center md:grid-cols-4 lg:grid-cols-4">
                    {GLOBAL_RECOGNITION.slice(0, 8).map((stat, index) => {
                        const Icon = iconMap[stat.icon as keyof typeof iconMap] || Trophy
                        return (
                            <div key={index} className="flex flex-col items-center text-center">
                                <div className="mb-4 rounded-full bg-white/10 p-4 backdrop-blur-sm transition-transform hover:scale-110">
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <span className="font-heading text-4xl font-bold md:text-5xl">{stat.count}</span>
                                <span className="mt-2 text-sm font-medium uppercase tracking-wider opacity-90 md:text-base">{stat.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
