import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"

// GET - Fetch coaches available for head coach assignment
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const excludeHeadCoaches = searchParams.get('excludeHeadCoaches') === 'true'
        const currentAcademyId = searchParams.get('academyId')

        console.log("👨‍🏫 AVAILABLE COACHES - Fetching with:", { excludeHeadCoaches, currentAcademyId })

        // Build where clause to filter coaches eligible for head coach position
        let whereClause: Record<string, unknown> = {
            user: { status: 'ACTIVE' }
        }

        if (excludeHeadCoaches) {
            // Get coaches without headOfAcademy OR currently assigned to this academy
            if (currentAcademyId) {
                whereClause = {
                    ...whereClause,
                    OR: [
                        { headOfAcademy: null },
                        { headOfAcademy: { id: currentAcademyId } }
                    ]
                }
            } else {
                whereClause = {
                    ...whereClause,
                    headOfAcademy: null
                }
            }
        }

        const coaches = await prisma.coach.findMany({
            where: whereClause,
            select: {
                id: true,
                coachId: true,
                fullName: true,
                photoUrl: true,
                primarySpecialization: true,
                experienceYears: true,
                coachingYears: true,
                guinnessRecords: true,
                limcaRecords: true,
                nationalMedals: true,
                headOfAcademy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { fullName: 'asc' }
        })

        const enrichedCoaches = coaches.map(coach => ({
            id: coach.id,
            coachId: coach.coachId,
            fullName: coach.fullName,
            photoUrl: coach.photoUrl,
            specialization: coach.primarySpecialization,
            experienceYears: coach.experienceYears,
            coachingYears: coach.coachingYears,
            isHeadCoach: !!coach.headOfAcademy,
            currentAcademy: coach.headOfAcademy,
            achievements: {
                guinnessRecords: coach.guinnessRecords,
                limcaRecords: coach.limcaRecords,
                nationalMedals: coach.nationalMedals
            }
        }))

        console.log("✅ AVAILABLE COACHES - Found", coaches.length, "coaches")

        return NextResponse.json({
            success: true,
            data: { coaches: enrichedCoaches },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("❌ AVAILABLE COACHES ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch coaches' } },
            { status: 500 }
        )
    }
}
