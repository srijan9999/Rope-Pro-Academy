"use client"

import { LOCATIONS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Clock } from "lucide-react"
import Link from "next/link"

export default function LocationsPage() {
    return (
        <div className="min-h-screen pb-20">
            <div className="bg-zinc-950 py-20 text-center text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl">Our Locations</h1>
                    <p className="mt-4 text-xl text-zinc-400">Find a Rope Pro Academy Training Center Near You</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-8 md:grid-cols-2">
                    {LOCATIONS.map((location) => (
                        <Card key={location.id} className="overflow-hidden">
                            {/* Map Placeholder */}
                            <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800">
                                {/* In production, use iframe with location.embedLink */}
                                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                                    [Google Map Embed: {location.name}]
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="font-heading text-xl font-bold uppercase">{location.name}</CardTitle>
                                <p className="text-sm font-medium text-primary">{location.type}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <span>{location.address}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <span>{location.timings}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <span>{location.contact}</span>
                                    </div>

                                    <div className="pt-4">
                                        <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black" asChild>
                                            <Link href="/contact">Book a Trial at this Branch</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
