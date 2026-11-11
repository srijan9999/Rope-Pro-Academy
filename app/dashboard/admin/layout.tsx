import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Server-side auth check — the real security boundary
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="flex min-h-[100dvh] pt-16 flex-col lg:flex-row w-full min-w-0">
            <DashboardSidebar role="admin" />
            <main className="flex-1 w-full min-w-0 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
