import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IdCard, IdCardProps } from "@/components/dashboard/IdCard"
import { ShieldAlert, Clock } from "lucide-react"

export const metadata = {
    title: "Student ID Card | Rope Pro Academy",
    description: "Official Student Athlete Digital ID Card and verification credential.",
}

interface PlayerIdCardPageProps {
    searchParams?: Promise<{
        studentId?: string
        userId?: string
    }>
}

export default async function PlayerIdCardPage({ searchParams }: PlayerIdCardPageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login?callbackUrl=/dashboard/player/id-card")
    }

    const resolvedParams = searchParams ? await searchParams : {}
    const isAdmin = session.user.role === "ADMIN"

    // Only Students and Admins can access this page
    if (session.user.role !== "STUDENT" && !isAdmin) {
        redirect("/dashboard")
    }

    // Determine target student: Admins can preview any student via query param; Students can ONLY view their own
    let targetWhere: { id?: string; userId?: string; studentId?: string } = {
        userId: session.user.id,
    }

    if (isAdmin && (resolvedParams.studentId || resolvedParams.userId)) {
        if (resolvedParams.studentId) {
            targetWhere = { studentId: resolvedParams.studentId }
        } else if (resolvedParams.userId) {
            targetWhere = { userId: resolvedParams.userId }
        }
    }

    const student = await prisma.student.findFirst({
        where: targetWhere,
        include: {
            user: {
                select: { status: true, email: true },
            },
            academy: {
                select: { name: true, location: true },
            },
        },
    })

    if (!student) {
        return (
            <div className="container max-w-4xl py-12">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-white">
                    <ShieldAlert className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
                    <h2 className="text-xl font-bold uppercase">Student Profile Not Found</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        We could not locate an associated student athlete profile for this account.
                    </p>
                </div>
            </div>
        )
    }

    // Gating check: Active students only
    const isActive = student.user.status === "ACTIVE"

    if (!isActive && !isAdmin) {
        return (
            <div className="container max-w-2xl py-12">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-white">
                    <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold uppercase">ID Card Available After Approval</h2>
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                        Your student registration is currently pending verification and fee clearance.
                        Your official digital ID card will become available immediately upon administrative approval.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                        <span>Enrollment Status:</span>
                        <span className="font-bold text-amber-400 uppercase">{student.user.status}</span>
                    </div>
                </div>
            </div>
        )
    }

    const cardProps: IdCardProps = {
        name: student.fullName,
        role: "STUDENT",
        photoUrl: student.photoUrl,
        idNumber: student.studentId,
        location: student.academy?.name || null,
        validUntil: student.cardExpiryDate
            ? new Date(student.cardExpiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
            : null,
    }

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E63946] block mb-1">
                    Credential Portal
                </span>
                <h1 className="font-heading text-3xl font-black uppercase text-foreground">
                    Student Digital ID Card
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Official biometric credential issued by Rope Pro Academy. Use for attendance check-in, academy access, and tournament registration.
                </p>
            </div>

            <div className="flex justify-center py-4">
                <IdCard {...cardProps} />
            </div>
        </div>
    )
}
