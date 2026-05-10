"use client"

import { useState } from "react"
import Link from "next/link"

import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SITE_CONFIG, LOCATIONS } from "@/lib/data"

export function SiteFooter() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        age: "",
        preferredLocation: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear message when user starts typing
        if (message) setMessage(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields
        if (!formData.name || !formData.phone || !formData.age || !formData.preferredLocation) {
            setMessage({ type: "error", text: "All fields are required." })
            return
        }

        setIsSubmitting(true)
        setMessage(null)

        try {
            const response = await fetch("/api/leads/quick", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            // Success - clear form and show message
            setFormData({ name: "", phone: "", age: "", preferredLocation: "" })
            setMessage({ type: "success", text: data.message })
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <footer className="bg-zinc-950 text-zinc-50 dark:bg-zinc-950 dark:text-zinc-50 border-t border-zinc-800">
            {/* Achievements Banner */}
            <div className="bg-primary py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-6 text-center text-sm font-bold uppercase text-white sm:gap-12 md:text-base">
                    <span>7 Guinness Records</span>
                    <span className="hidden sm:inline">•</span>
                    <span>100+ National Champions</span>
                    <span className="hidden sm:inline">•</span>
                    <span>300+ Students</span>
                    <span className="hidden sm:inline">•</span>
                    <span>15+ Coaches</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-5">

                {/* Column 1: About */}
                <div className="flex flex-col gap-4">
                    {/* Logo */}

                    <h3 className="font-heading text-lg font-bold uppercase text-primary">About Us</h3>
                    <p className="text-sm text-zinc-400">
                        {SITE_CONFIG.description}
                    </p>
                    <div className="text-sm text-zinc-400">
                        <span className="font-semibold text-white">Founded:</span> {SITE_CONFIG.founded}<br />
                        <span className="font-semibold text-white">Founder:</span> {SITE_CONFIG.founder}
                    </div>
                    <div className="flex gap-4">
                        <Link href={SITE_CONFIG.socials.instagram} className="hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                        <Link href={SITE_CONFIG.socials.facebook} className="hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                        <Link href={SITE_CONFIG.socials.youtube} className="hover:text-primary"><Youtube className="h-5 w-5" /></Link>
                        <Link href={SITE_CONFIG.socials.twitter} className="hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-heading text-lg font-bold uppercase text-primary">Quick Links</h3>
                    <nav className="flex flex-col gap-2 text-sm text-zinc-400">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <Link href="/about-us" className="hover:text-primary">About Us</Link>
                        <Link href="/programs" className="hover:text-primary">Programs & Classes</Link>
                        <Link href="/coaches" className="hover:text-primary">Our Coaches</Link>
                        <Link href="/locations" className="hover:text-primary">Locations</Link>
                        <Link href="/gallery" className="hover:text-primary">Gallery</Link>
                        <Link href="/events" className="hover:text-primary">Events</Link>
                        <Link href="/blog" className="hover:text-primary">Blog</Link>
                    </nav>
                </div>

                {/* Column 3: Locations */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-heading text-lg font-bold uppercase text-primary">Our Locations</h3>
                    <div className="flex flex-col gap-3 text-sm text-zinc-400">
                        {LOCATIONS.map((loc) => (
                            <div key={loc.id} className="flex flex-col">
                                <span className="font-semibold text-white">{loc.name}</span>
                                <span>{loc.contact}</span>
                            </div>
                        ))}
                        <Link href="/locations" className="flex items-center gap-1 text-primary hover:underline">
                            <MapPin className="h-4 w-4" /> View All on Map
                        </Link>
                    </div>
                </div>

                {/* Column 4: Contact */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-heading text-lg font-bold uppercase text-primary">Contact Info</h3>
                    <div className="flex flex-col gap-3 text-sm text-zinc-400">
                        <div className="flex gap-2">
                            <Mail className="h-4 w-4 mt-1 shrink-0 text-primary" />
                            <span>{SITE_CONFIG.contact.email}</span>
                        </div>
                        <div className="flex gap-2">
                            <Phone className="h-4 w-4 mt-1 shrink-0 text-primary" />
                            <span>{SITE_CONFIG.contact.phone}</span>
                        </div>
                        <div className="flex gap-2">
                            <Clock className="h-4 w-4 mt-1 shrink-0 text-primary" />
                            <span>{SITE_CONFIG.contact.hours}</span>
                        </div>
                        <div className="flex gap-2">
                            <MapPin className="h-4 w-4 mt-1 shrink-0 text-primary" />
                            <span>{SITE_CONFIG.contact.address}</span>
                        </div>
                    </div>
                </div>

                {/* Column 5: Quick Registration */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-heading text-lg font-bold uppercase text-primary">Quick Register</h3>
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                        <Input
                            name="name"
                            placeholder="Your Name"
                            className="bg-zinc-900 border-zinc-700 h-9"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                        <Input
                            name="phone"
                            placeholder="Phone Number"
                            className="bg-zinc-900 border-zinc-700 h-9"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                        <Input
                            name="age"
                            placeholder="Age"
                            className="bg-zinc-900 border-zinc-700 h-9"
                            value={formData.age}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                        <Input
                            name="preferredLocation"
                            placeholder="Preferred Location"
                            className="bg-zinc-900 border-zinc-700 h-9"
                            value={formData.preferredLocation}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="w-full bg-primary hover:bg-red-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Get Started"}
                        </Button>

                        {/* Feedback Message */}
                        {message && (
                            <div className={`flex items-center gap-2 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                                {message.type === "success" ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 py-6 md:flex-row md:gap-0 text-xs text-zinc-500">
                <p>Copyright © {new Date().getFullYear()} {SITE_CONFIG.name}. All Rights Reserved. Founded by {SITE_CONFIG.founder} in 2010.</p>
                <div className="flex gap-4">
                    <span>Safe Environment</span>
                    <span>Certified Coaches</span>
                    <span>Quality Equipment</span>
                </div>
                <p>Designed & Developed for Rope Pro Academy</p>
            </div>
        </footer>
    )
}

