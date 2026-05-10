"use client"

import { useState } from "react"
import { SITE_CONFIG } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (feedback) setFeedback(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        if (!formData.firstName || !formData.email || !formData.message) {
            setFeedback({ type: "error", text: "First name, email, and message are required." })
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setFeedback({ type: "error", text: "Please enter a valid email address." })
            return
        }

        setIsSubmitting(true)
        setFeedback(null)

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            // Success - clear form and show message
            setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" })
            setFeedback({ type: "success", text: "Thank you! We have received your message and will reply shortly." })
        } catch (error) {
            setFeedback({
                type: "error",
                text: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="bg-zinc-950 py-20 text-center text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-heading text-4xl font-black uppercase md:text-6xl">Contact Us</h1>
                    <p className="mt-4 text-xl text-zinc-400">Get in touch with Rope Pro Academy</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Contact Info */}
                    <div>
                        <h2 className="mb-6 font-heading text-2xl font-bold uppercase text-primary">Get in Touch</h2>
                        <div className="space-y-6">
                            <p className="text-muted-foreground">
                                Have questions about our programs, fees, or locations? Reach out to us and our team will get back to you shortly.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Phone</h3>
                                        <p className="text-muted-foreground">{SITE_CONFIG.contact.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Email</h3>
                                        <p className="text-muted-foreground">{SITE_CONFIG.contact.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Main Office</h3>
                                        <p className="text-muted-foreground">{SITE_CONFIG.contact.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Office Hours</h3>
                                        <p className="text-muted-foreground">{SITE_CONFIG.contact.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-2xl border bg-card p-8 shadow-sm">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name *</label>
                                    <Input
                                        name="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input
                                        name="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email *</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input
                                    name="phone"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message *</label>
                                <Textarea
                                    name="message"
                                    placeholder="How can we help you?"
                                    className="min-h-[120px]"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Feedback Message */}
                            {feedback && (
                                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${feedback.type === "success"
                                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                        : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                    }`}>
                                    {feedback.type === "success" ? (
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                    )}
                                    <span>{feedback.text}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-primary hover:bg-red-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

