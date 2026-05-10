"use client"

import Link from "next/link"
import { LOCATIONS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock } from "lucide-react"

export function LocationsSection() {
    return (
        <section className="py-20 md:py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-heading text-3xl font-bold uppercase text-primary md:text-4xl">Our Locations</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">Conveniently located training centers across Delhi</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {LOCATIONS.map((location) => (
                        <div key={location.id} className="flex flex-col rounded-xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <h3 className="mb-2 font-heading text-lg font-bold uppercase">{location.name}</h3>
                            <p className="mb-1 text-xs font-semibold text-primary">{location.type}</p>
                            <p className="mb-4 text-sm text-muted-foreground">{location.address}</p>

                            <div className="mt-auto space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs">{location.timings}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs">{location.contact}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button variant="outline" className="w-full text-xs" asChild>
                                    <Link href="/locations">View on Map</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
