'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { HERO_CONTENT, GLOBAL_RECOGNITION } from '@/lib/data'

export function HeroSection() {
    // Pick 4 key stats from GLOBAL_RECOGNITION
    const stats = [
        { value: '300+', label: 'Students Trained' },
        { value: '15+', label: 'Expert Coaches' },
        { value: '4', label: 'Locations' },
        { value: '7', label: 'World Records' },
    ]

    return (
        <section
            className="relative min-h-screen w-full overflow-hidden"
            aria-label="Hero section with background video"
        >
            {/* Background YouTube Video */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <iframe
                    className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[100vw] md:h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 object-cover"
                    src="https://www.youtube.com/embed/RTpVwcrp-p4?autoplay=1&mute=1&controls=0&loop=1&playlist=RTpVwcrp-p4&rel=0&playsinline=1&modestbranding=1"
                    title="Rope Pro Background"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>

                {/* Dark Overlay so your white text stays readable */}
                <div className="absolute inset-0 bg-black/60 z-10"></div>
            </div>

            {/* Gradient Overlay for Better Text Contrast */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mx-auto max-w-5xl text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 backdrop-blur-sm border border-red-500/30"
                    >
                        <Trophy className="h-4 w-4" />
                        7× Guinness World Record Holders
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mb-6 text-4xl font-extrabold tracking-tight text-white leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        Master the Art of{' '}
                        <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                            Rope Skipping
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mb-10 text-base font-medium text-gray-200 sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto"
                    >
                        {HERO_CONTENT.tagline}. Train with world champions,
                        master advanced techniques, and transform your fitness journey.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold shadow-xl shadow-red-600/50 hover:shadow-2xl hover:shadow-red-600/60 transition-all duration-300 group"
                        >
                            <Link href="/register/player">
                                Start Your Journey
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 px-8 py-6 text-lg font-semibold"
                        >
                            <Link href="/about-us">
                                Watch Our Story
                                <Play className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Coach CTA */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.15 }}
                        className="text-sm text-gray-400 mb-12"
                    >
                        Are you a coach?{' '}
                        <Link
                            href="/register/coach"
                            className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-4 transition-colors"
                        >
                            Apply here →
                        </Link>
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 max-w-4xl mx-auto"
                    >
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4"
                            >
                                <div className="text-2xl font-bold text-white mb-1 sm:text-3xl">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-300 sm:text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm text-gray-300 font-medium">Scroll to explore</span>
                        <div className="h-8 w-5 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
                            <motion.div
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="h-2 w-1 rounded-full bg-white/60"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
