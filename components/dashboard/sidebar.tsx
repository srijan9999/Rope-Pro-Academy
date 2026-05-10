"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Calendar, Trophy, Settings, LogOut, FileText, IndianRupee, Building2, ClipboardCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

type DashboardRole = "player" | "coach" | "admin"

interface SidebarProps {
    role: DashboardRole
}

const sidebarItems = {
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
        { href: "/dashboard/coach/profile", icon: Settings, label: "My Profile" },
    ],
    admin: [
        { href: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/admin/academies", icon: Building2, label: "Academies" },
        { href: "/dashboard/admin/users", icon: Users, label: "Users" },
        { href: "/dashboard/admin/requests", icon: ClipboardCheck, label: "Requests" },
        { href: "/dashboard/admin/finance", icon: IndianRupee, label: "Finance" },
    ],
}

export function DashboardSidebar({ role }: SidebarProps) {
    const pathname = usePathname()
    const items = sidebarItems[role]

    return (
        <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 border-r bg-background lg:block">
            <div className="flex h-full flex-col gap-2 py-4">
                <div className="px-6 py-2">
                    <h2 className="mb-2 px-2 text-lg font-bold tracking-tight uppercase text-primary">
                        {role} Portal
                    </h2>
                </div>
                <nav className="grid items-start px-4 text-sm font-medium">
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </aside>
    )
}
