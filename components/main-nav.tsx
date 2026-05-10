"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname()

    const routes = [
        {
            href: "/",
            label: "Home",
            active: pathname === "/",
        },
        {
            href: "/about-us",
            label: "About Us",
            active: pathname.startsWith("/about-us"),
        },
        {
            href: "/programs",
            label: "Programs",
            active: pathname.startsWith("/programs"),
        },
        {
            href: "/coaches",
            label: "Our Coaches",
            active: pathname.startsWith("/coaches"),
        },
        {
            href: "/locations",
            label: "Locations",
            active: pathname.startsWith("/locations"),
        },
        {
            href: "/contact",
            label: "Contact",
            active: pathname.startsWith("/contact"),
        },
    ]

    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
            {...props}
        >
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary uppercase tracking-wide",
                        route.active
                            ? "text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    {route.label}
                </Link>
            ))}
        </nav>
    )
}
