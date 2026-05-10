import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function PlayerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen pt-16">
            <DashboardSidebar role="player" />
            <main className="flex-1 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
