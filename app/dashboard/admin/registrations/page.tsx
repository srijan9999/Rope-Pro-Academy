import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import RegistrationsTable, { type RegistrationRow } from "@/components/admin/RegistrationsTable"
import { ClipboardCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Registrations & Verification | Admin Portal",
}

export default async function AdminRegistrationsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    // Query registrations with only the fields needed for verification
    const rawStudents = await prisma.student.findMany({
        select: {
            id: true,
            fullName: true,
            studentId: true,
            school: true,
            selectedPlan: true,
            feeAmount: true,
            utrNumber: true,
            paymentSubmittedAt: true,
            paymentReviewedAt: true,
            paymentRejectionNote: true,
            status: true,
            createdAt: true,
            user: {
                select: {
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    const registrations: RegistrationRow[] = rawStudents.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        studentId: s.studentId,
        school: s.school,
        selectedPlan: s.selectedPlan,
        feeAmount: s.feeAmount,
        utrNumber: s.utrNumber,
        paymentSubmittedAt: s.paymentSubmittedAt ? s.paymentSubmittedAt.toISOString() : null,
        paymentReviewedAt: s.paymentReviewedAt ? s.paymentReviewedAt.toISOString() : null,
        paymentRejectionNote: s.paymentRejectionNote,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        userEmail: s.user?.email ?? null,
    }))

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#E63946]/10 text-[#E63946]">
                            <ClipboardCheck className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl font-black font-heading tracking-tight uppercase text-foreground">
                            Student Registrations & Payments
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Match submitted 12-digit UTR numbers against your bank or UPI statements to approve and activate athletes.
                    </p>
                </div>
            </div>

            {/* Interactive Registrations Table */}
            <RegistrationsTable initialRegistrations={registrations} />
        </div>
    )
}
