import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getRoleHome } from "@/lib/auth-routes"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
    let session = null
    try {
        session = await getServerSession(authOptions)
    } catch (error) {
        // Safe non-sensitive diagnostic log; fail open to rendering login form
        console.error("[Login] Session retrieval error:", error instanceof Error ? error.name : "Unknown")
    }

    // Revocation-aware: session.user only exists if token is not revoked and status is ACTIVE
    if (session?.user?.role) {
        redirect(getRoleHome(session.user.role))
    }

    return <LoginForm />
}
