import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function PlayerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[100dvh] pt-16 flex-col lg:flex-row w-full min-w-0">
            <DashboardSidebar role="player" />
            <main className="flex-1 w-full min-w-0 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
