import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function CoachLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[100dvh] pt-16 flex-col lg:flex-row w-full min-w-0">
            <DashboardSidebar role="coach" />
            <main className="flex-1 w-full min-w-0 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
