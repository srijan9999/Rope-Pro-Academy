"use client"

import Link from "next/link"
import { PROGRAMS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function ProgramsGrid() {
    return (
        <section className="py-20 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-heading text-3xl font-bold uppercase text-primary md:text-4xl">Our Programs</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">Structured training paths for every age and skill level</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {PROGRAMS.map((program, index) => (
                        <Card key={index} className="flex flex-col border-zinc-200 dark:border-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-heading text-xl font-bold uppercase">{program.title}</CardTitle>
                                <CardDescription>{program.ageGroup} | {program.duration}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="mb-4 text-sm text-muted-foreground">{program.description}</p>
                                <ul className="space-y-2">
                                    {program.focus.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                                            <Check className="h-4 w-4 shrink-0 text-primary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex-col gap-4 border-t pt-6 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div className="text-center">
                                    <span className="text-lg font-bold text-primary">{program.price}</span>
                                </div>
                                <Button className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200" asChild>
                                    <Link href="/programs">Learn More</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button size="lg" className="bg-primary text-white hover:bg-red-700" asChild>
                        <Link href="/register/player">Book a Free Trial Class</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
