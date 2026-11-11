"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Calendar,
    Trophy,
    Settings,
    LogOut,
    IndianRupee,
    Building2,
    ClipboardCheck,
    CreditCard,
    Image as ImageIcon,
    Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

export type DashboardRole = "player" | "coach" | "admin"

export interface NavItem {
    href: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    badge?: string | number
}

export const sidebarItems: Record<DashboardRole, NavItem[]> = {
    player: [
        { href: "/dashboard/player", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/player/schedule", icon: Calendar, label: "My Schedule" },
        { href: "/dashboard/player/progress", icon: Trophy, label: "Progress & Levels" },
        { href: "/dashboard/player/id-card", icon: CreditCard, label: "ID Card" },
        { href: "/dashboard/player/profile", icon: Settings, label: "My Profile" },
    ],
    coach: [
        { href: "/dashboard/coach", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/coach/schedule", icon: Calendar, label: "My Schedule" },
        { href: "/dashboard/coach/students", icon: Users, label: "My Students" },
        { href: "/dashboard/coach/id-card", icon: CreditCard, label: "ID Card" },
        { href: "/dashboard/coach/profile", icon: Settings, label: "My Profile" },
    ],
    admin: [
        { href: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/admin/registrations", icon: ClipboardCheck, label: "Registrations" },
        { href: "/dashboard/admin/academies", icon: Building2, label: "Academies" },
        { href: "/dashboard/admin/users", icon: Users, label: "Users" },
        { href: "/dashboard/admin/media", icon: ImageIcon, label: "Media Gallery" },
        { href: "/dashboard/admin/pending-payments", icon: ClipboardCheck, label: "Pending Payments" },
        { href: "/dashboard/admin/requests", icon: ClipboardCheck, label: "Requests" },
        { href: "/dashboard/admin/finance", icon: IndianRupee, label: "Finance" },
    ],
}

export const roleTitles: Record<DashboardRole, string> = {
    admin: "Admin Portal",
    coach: "Coach Portal",
    player: "Player Portal",
}

export function isItemActive(pathname: string, href: string): boolean {
    if (pathname === href) return true
    // Exact match only for root dashboard endpoints
    if (href === "/dashboard/admin" || href === "/dashboard/coach" || href === "/dashboard/player") {
        return false
    }
    return pathname.startsWith(href + "/")
}

interface SidebarProps {
    role: DashboardRole
}

export function DashboardSidebar({ role }: SidebarProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const items = sidebarItems[role]
    const title = roleTitles[role]

    // Close mobile drawer on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <>
            {/* Mobile / Tablet Top Bar (Visible below lg: 1024px) */}
            <header className="sticky top-16 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:hidden min-h-[44px]">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(true)}
                        className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg"
                        aria-label={`Open ${title} navigation menu`}
                        aria-expanded={isOpen}
                        aria-controls="portal-mobile-drawer"
                    >
                        <Menu className="h-6 w-6 text-foreground" />
                    </Button>
                    <span className="text-sm font-bold tracking-tight uppercase text-primary">
                        {title}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 min-h-[44px] px-3 gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    aria-label="Sign out of portal"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </Button>
            </header>

            {/* Mobile Slide-in Drawer (Sheet) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent
                    id="portal-mobile-drawer"
                    side="left"
                    className="w-[280px] sm:w-[320px] p-0 flex flex-col h-[100dvh] motion-reduce:transition-none"
                    aria-label={`${title} navigation drawer`}
                >
                    <SheetHeader className="p-4 border-b text-left">
                        <SheetTitle className="text-base font-bold uppercase tracking-tight text-primary">
                            {title}
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            {title} navigation menu items
                        </SheetDescription>
                    </SheetHeader>

                    <nav
                        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
                        aria-label={`${title} Links`}
                    >
                        {items.map((item) => {
                            const active = isItemActive(pathname, item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "group flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:text-primary active:bg-primary/5",
                                        active
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && (
                                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-auto border-t p-4 pb-[env(safe-area-inset-bottom,1rem)]">
                        <Button
                            variant="ghost"
                            className="w-full min-h-[44px] justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            Sign Out
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Persistent Sidebar (Visible at lg >= 1024px) */}
            <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] w-64 border-r bg-background lg:block">
                <div className="flex h-full flex-col gap-2 py-4">
                    <div className="px-6 py-2">
                        <h2 className="mb-2 px-2 text-lg font-bold tracking-tight uppercase text-primary">
                            {title}
                        </h2>
                    </div>
                    <nav className="grid items-start px-4 text-sm font-medium space-y-1" aria-label={`${title} Links`}>
                        {items.map((item) => {
                            const active = isItemActive(pathname, item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "group flex items-center justify-between rounded-lg px-3 py-2 transition-all hover:text-primary",
                                        active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && (
                                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="mt-auto p-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}
