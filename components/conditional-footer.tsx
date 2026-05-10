"use client"

import { usePathname } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"

export function ConditionalFooter() {
    const pathname = usePathname()
    const isDashboard = pathname?.startsWith("/dashboard")

    if (isDashboard) {
        return null
    }

    return <SiteFooter />
}
