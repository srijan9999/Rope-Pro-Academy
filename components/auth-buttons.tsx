"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, LayoutDashboard, Loader2 } from "lucide-react"

export function AuthButtons() {
    const { data: session, status } = useSession()

    // Loading state
    if (status === "loading") {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Logged In - Show User Avatar Dropdown
    if (session?.user) {
        // Determine dashboard path based on role
        const role = session.user.role?.toLowerCase() || "player"
        const dashboardPath = `/dashboard/${role === "student" ? "player" : role}`

        // Get initials from name or email
        const name = session.user.name || session.user.email || "User"
        const initials = name.charAt(0).toUpperCase()

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary transition-colors">
                            <AvatarFallback className="bg-primary text-white font-bold text-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {session.user.email}
                            </p>
                            <span className="text-xs text-primary font-medium capitalize mt-1">
                                {role} Account
                            </span>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={dashboardPath} className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`${dashboardPath}/profile`} className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // Logged Out - Show Login and Register buttons
    return (
        <>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-red-700">
                <Link href="/register/player">Register Now</Link>
            </Button>
        </>
    )
}
