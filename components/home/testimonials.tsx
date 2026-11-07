"use client"

import { useState, useEffect, useCallback } from "react"
import { TESTIMONIALS, type TestimonialItem } from "@/content/testimonials"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const total = TESTIMONIALS.length

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1))
    }, [total])

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1))
    }, [total])

    // Keyboard navigation (Left / Right arrow keys)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handlePrev()
            } else if (e.key === "ArrowRight") {
                handleNext()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handlePrev, handleNext])

    const currentItem: TestimonialItem = TESTIMONIALS[currentIndex]

    return (
        <section
            id="testimonials"
            className="py-24 md:py-32 bg-zinc-950 text-white border-b border-zinc-800"
            aria-labelledby="testimonials-heading"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
                        Proven Excellence
                    </span>
                    <h2
                        id="testimonials-heading"
                        className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight"
                    >
                        Athlete & Parent <span className="text-[#E63946]">Testimonials</span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-zinc-400">
                        Real experiences and thoughts from athletes, national champions, and coaches training with Rope Pro Academy.
                    </p>
                </div>

                {/* Slider Container */}
                <div
                    className="relative max-w-4xl mx-auto rounded-2xl bg-zinc-900/90 border border-zinc-800 p-8 sm:p-12 lg:p-14 shadow-2xl"
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Athlete testimonials slider"
                >
                    {/* Large Quote Accent */}
                    <div className="absolute top-6 right-8 text-[#E63946]/20 pointer-events-none">
                        <Quote className="w-16 h-16 sm:w-20 sm:h-20" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                        {/* Avatar / Initial Fallback */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#E63946] bg-zinc-800 flex items-center justify-center text-xl sm:text-2xl font-extrabold text-[#E63946] shadow-md font-heading">
                                {currentItem.avatarFallback}
                            </div>
                            <span className="absolute -bottom-2 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-[#E63946] text-white text-xs font-bold shadow">
                                ★
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center sm:text-left">
                            {/* Stars */}
                            <div
                                className="flex items-center justify-center sm:justify-start gap-1 text-[#E63946] mb-3"
                                aria-label="5 out of 5 stars"
                            >
                                {[...Array(currentItem.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-base sm:text-lg lg:text-xl font-medium text-zinc-100 leading-relaxed italic mb-6">
                                &ldquo;{currentItem.quote}&rdquo;
                            </blockquote>

                            {/* Athlete Info */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                                        {currentItem.name}
                                    </h3>
                                    {currentItem.badge && (
                                        <span className="inline-block self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40">
                                            {currentItem.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                                    {currentItem.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Accessible Controls: Prev/Next & Dots */}
                    <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Dot indicators */}
                        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
                            {TESTIMONIALS.map((item, idx) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={currentIndex === idx}
                                    aria-label={`Go to slide ${idx + 1}: ${item.name}`}
                                    onClick={() => setCurrentIndex(idx)}
                                    suppressHydrationWarning
                                    className={`h-2.5 rounded-full transition-all duration-200 min-w-[20px] ${
                                        currentIndex === idx
                                            ? "w-8 bg-[#E63946]"
                                            : "w-2.5 bg-zinc-700 hover:bg-zinc-500"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons (min 44px touch targets) */}
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handlePrev}
                                aria-label="Previous testimonial"
                                className="h-11 w-11 rounded-full border-zinc-700 bg-zinc-800/80 hover:bg-[#E63946] hover:text-white hover:border-[#E63946] text-zinc-200 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <span className="text-xs text-zinc-400 font-mono">
                                {currentIndex + 1} / {total}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleNext}
                                aria-label="Next testimonial"
                                className="h-11 w-11 rounded-full border-zinc-700 bg-zinc-800/80 hover:bg-[#E63946] hover:text-white hover:border-[#E63946] text-zinc-200 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
