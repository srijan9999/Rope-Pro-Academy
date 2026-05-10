"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { AuthButtons } from "@/components/auth-buttons"
import { getDashboardLink } from "@/lib/utils"

export function SiteHeader() {
    const { data: session, status } = useSession()

    // Determine logo link based on auth status
    const logoHref = status === "authenticated"
        ? getDashboardLink(session?.user?.role)
        : "/"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
                <div className="flex items-center gap-8">

                    <Link href={logoHref} className="flex items-center gap-2">
                        {/* Official Logo */}
                        <Image
                            src="/full-logo.jpg"
                            alt="Rope Pro Academy - India's Premier Rope Skipping Academy"
                            width={180}
                            height={60}
                            className="h-10 w-auto sm:h-12 md:h-14"
                            priority
                        />
                    </Link>
                    <MainNav className="hidden md:flex" />
                </div>

                <div className="flex items-center gap-2">
                    {/* Auth Buttons - Shows Login/Register or User Avatar based on session */}
                    <AuthButtons />
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}

