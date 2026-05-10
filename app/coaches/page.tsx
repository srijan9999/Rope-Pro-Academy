"use client"

import { COACHES } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CoachesPage() {
    return (
        <div className="min-h-screen pb-20">
            <div className="bg-zinc-950 py-20 text-center text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl">Our Coaches</h1>
                    <p className="mt-4 text-xl text-zinc-400">15+ Professional Experts Guiding You to Excellence</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filter Tabs (Optional for future, currently showing all) */}

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {COACHES.map((coach, index) => (
                        <Card key={index} className="overflow-hidden border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                                {/* Placeholder Image */}
                                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                    [Photo: {coach.name}]
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                        {coach.specialization}
                                    </Badge>
                                    <span className="text-xs font-medium text-muted-foreground self-center">
                                        {coach.experience} Exp.
                                    </span>
                                </div>

                                <h2 className="font-heading text-2xl font-bold uppercase">{coach.name}</h2>
                                <p className="text-sm font-medium text-muted-foreground">{coach.role}</p>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h4 className="mb-2 text-xs font-bold uppercase text-zinc-500">Achievements</h4>
                                        <ul className="space-y-1 text-sm">
                                            {coach.achievements.map((ach, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                    <span>{ach}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
                                        &quot;{coach.bio}&quot;
                                    </blockquote>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
