"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()

    const toggleMenu = () => setIsOpen(!isOpen)

    // Close menu when route changes
    React.useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevent body scroll when menu is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const routes = [
        { href: "/", label: "Home" },
        { href: "/about-us", label: "About Us" },
        { href: "/programs", label: "Programs" },
        { href: "/coaches", label: "Our Coaches" },
        { href: "/locations", label: "Locations" },
        { href: "/contact", label: "Contact" },
    ]

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-16 z-50 bg-background border-b shadow-lg overflow-y-auto"
                        style={{ maxHeight: "calc(100dvh - 4rem)" }}
                    >
                        <div className="container py-6 flex flex-col">
                            <nav className="flex flex-col gap-6 items-center text-center">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "text-lg font-medium transition-colors hover:text-primary uppercase tracking-wide w-full",
                                            pathname === route.href ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {route.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-8 flex flex-col gap-4 pb-8">
                                <Button asChild variant="outline" className="w-full justify-center border-black text-black dark:border-white dark:text-white font-semibold h-12 text-base">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild className="w-full justify-center bg-[#E63946] hover:bg-red-700 text-white font-semibold h-12 text-base">
                                    <Link href="/register/player">Register Now</Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
