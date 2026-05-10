"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut, ArrowLeft } from "lucide-react"

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    useEffect(() => {
        // Push a dummy state to history to trap the back button
        window.history.pushState({ sessionGuard: true }, "", window.location.href)

        const handlePopState = (event: PopStateEvent) => {
            // When back button is pressed, re-push state and show modal
            window.history.pushState({ sessionGuard: true }, "", window.location.href)
            setShowLogoutModal(true)
        }

        window.addEventListener("popstate", handlePopState)

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [])

    const handleStayLoggedIn = () => {
        setShowLogoutModal(false)
    }

    const handleLogout = () => {
        signOut({ callbackUrl: "/login" })
    }

    return (
        <>
            {children}

            <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                            You are leaving the Dashboard
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Going back will log you out of your account. Do you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={handleStayLoggedIn}>
                            Stay Logged In
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Yes, Log Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
