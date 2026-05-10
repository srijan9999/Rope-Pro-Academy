"use client"

import Link from "next/link"
import { PROGRAMS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Activity, Zap, Award, Star } from "lucide-react"

const iconMap = {
    Activity, Zap, Award, Star
}

export default function ProgramsPage() {
    return (
        <div className="min-h-screen pb-20">
            <div className="bg-zinc-950 py-20 text-center text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl">Programs & Classes</h1>
                    <p className="mt-4 text-xl text-zinc-400">Structured Training from Basics to Elite Competition</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-8 lg:grid-cols-2">
                    {PROGRAMS.map((program, index) => {
                        const Icon = iconMap[program.icon as keyof typeof iconMap] || Activity
                        return (
                            <div key={index} className="flex flex-col rounded-2xl border bg-card p-8 shadow-sm dark:border-zinc-800">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-primary">{program.price}</div>
                                        <div className="text-sm text-muted-foreground">{program.duration}</div>
                                    </div>
                                </div>

                                <h2 className="mb-2 font-heading text-2xl font-bold uppercase">{program.title}</h2>
                                <p className="mb-6 text-muted-foreground">{program.description}</p>

                                <div className="mb-8 rounded-xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
                                    <h3 className="mb-4 font-bold uppercase text-sm text-zinc-500">Program Focus</h3>
                                    <ul className="space-y-3">
                                        {program.focus.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className="h-5 w-5 shrink-0 text-primary" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto">
                                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">Age Group:</span> {program.ageGroup}
                                    </div>
                                    <Button size="lg" className="w-full bg-primary hover:bg-red-700" asChild>
                                        <Link href="/register/player">Enroll Now</Link>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-20 rounded-3xl bg-zinc-900 p-8 text-center text-white md:p-12">
                    <h2 className="font-heading text-3xl font-bold uppercase md:text-4xl">Not sure which program is right?</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                        Book a free trial class and our coaches will assess your skill level to recommend the perfect batch for you.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" variant="secondary" className="bg-white text-black hover:bg-zinc-200" asChild>
                            <Link href="/contact">Contact Us</Link>
                        </Button>
                        <Button size="lg" className="bg-primary hover:bg-red-700" asChild>
                            <Link href="/register/player">Book Free Trial</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
