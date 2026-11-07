import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IdCard, IdCardProps } from "@/components/dashboard/IdCard"
import { ShieldAlert, Clock } from "lucide-react"

export const metadata = {
    title: "Coach ID Card | Rope Pro Academy",
    description: "Official Coach Digital ID Card and verification credential.",
}

interface CoachIdCardPageProps {
    searchParams?: Promise<{
        coachId?: string
        userId?: string
    }>
}

export default async function CoachIdCardPage({ searchParams }: CoachIdCardPageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login?callbackUrl=/dashboard/coach/id-card")
    }

    const resolvedParams = searchParams ? await searchParams : {}
    const isAdmin = session.user.role === "ADMIN"

    // Only Coaches and Admins can access this page
    if (session.user.role !== "COACH" && !isAdmin) {
        redirect("/dashboard")
    }

    // Determine target coach: Admins can preview any coach via query param; Coaches can ONLY view their own
    let targetWhere: { id?: string; userId?: string; coachId?: string } = {
        userId: session.user.id,
    }

    if (isAdmin && (resolvedParams.coachId || resolvedParams.userId)) {
        if (resolvedParams.coachId) {
            targetWhere = { coachId: resolvedParams.coachId }
        } else if (resolvedParams.userId) {
            targetWhere = { userId: resolvedParams.userId }
        }
    }

    const coach = await prisma.coach.findFirst({
        where: targetWhere,
        include: {
            user: {
                select: { status: true, email: true },
            },
            headOfAcademy: {
                select: { name: true, location: true },
            },
        },
    })

    if (!coach) {
        return (
            <div className="container max-w-4xl py-12">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-white">
                    <ShieldAlert className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
                    <h2 className="text-xl font-bold uppercase">Coach Profile Not Found</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        We could not locate an associated coach profile for this account. Please contact administrative support.
                    </p>
                </div>
            </div>
        )
    }

    // Gating check: Coach must be approved or active
    const isApproved =
        coach.isApproved ||
        coach.applicationStatus === "APPROVED" ||
        coach.user.status === "ACTIVE"

    if (!isApproved && !isAdmin) {
        return (
            <div className="container max-w-2xl py-12">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-white">
                    <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold uppercase">ID Card Pending Approval</h2>
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                        Your coach application is currently under review by academy leadership.
                        Your official digital ID card will become available immediately once your onboarding and credentials are approved.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                        <span>Application Status:</span>
                        <span className="font-bold text-amber-400 uppercase">{coach.applicationStatus}</span>
                    </div>
                </div>
            </div>
        )
    }

    const cardProps: IdCardProps = {
        name: coach.fullName,
        role: "COACH",
        photoUrl: coach.photoUrl,
        idNumber: coach.coachId,
        location: coach.headOfAcademy?.name || null,
    }

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E63946] block mb-1">
                    Credential Portal
                </span>
                <h1 className="font-heading text-3xl font-black uppercase text-foreground">
                    Coach Digital ID Card
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Official biometric credential issued by Rope Pro Academy. Use for campus access and tournament identification.
                </p>
            </div>

            <div className="flex justify-center py-4">
                <IdCard {...cardProps} />
            </div>
        </div>
    )
}
