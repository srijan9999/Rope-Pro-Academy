import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getRoleHome } from "@/lib/auth-routes"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
    const session = await getServerSession(authOptions)

    // Revocation-aware: session.user only exists if token is not revoked and status is ACTIVE
    if (session?.user?.role) {
        redirect(getRoleHome(session.user.role))
    }

    return <LoginForm />
}
