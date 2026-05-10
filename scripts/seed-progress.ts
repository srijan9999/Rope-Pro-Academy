
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding progress data...')

    // 1. Get a student (or create one if needed)
    // Ideally, change this email to an existing student in your DB
    const studentEmail = 'student@example.com'
    let student = await prisma.student.findFirst({
        where: { user: { email: studentEmail } }
    })

    // Basic fallback if no specific student found, just get the first one
    if (!student) {
        student = await prisma.student.findFirst()
    }

    if (!student) {
        console.error('❌ No student found to seed data for. Please create a student first.')
        return
    }

    // 2. Get a coach
    const coach = await prisma.coach.findFirst()
    if (!coach) {
        console.error('❌ No coach found. Please create a coach first.')
        return
    }

    console.log(`Using Student: ${student.id}`)
    console.log(`Using Coach: ${coach.id}`)

    // 3. Create historical reports (Last 3 months)
    const months = [2, 1, 0] // Months ago

    for (const monthAgo of months) {
        const date = new Date()
        date.setMonth(date.getMonth() - monthAgo)

        // Improvement curve
        const baseScore = 60 + (2 - monthAgo) * 5 // 60, 65, 70

        await prisma.progressReport.create({
            data: {
                studentId: student.id,
                coachId: coach.id,
                date: date,
                assessmentType: 'REGULAR',
                currentLevel: 'INTERMEDIATE',
                recommendedLevel: monthAgo === 0 ? 'ADVANCED' : null,

                // Metrics
                speed: 80 + (2 - monthAgo) * 5,
                endurance: 3.5 + (2 - monthAgo) * 0.5,
                freestyle: 5 + (2 - monthAgo),
                doubleUnders: 10 + (2 - monthAgo) * 5,

                // Proficiency
                speedScore: baseScore + 5,
                enduranceScore: baseScore,
                freestyleScore: baseScore - 5,
                doubleUndersScore: baseScore + 2,
                techniqueScore: baseScore + 8,
                overallScore: baseScore,

                performanceGrade: monthAgo === 0 ? 'B_PLUS' : 'B',
                feedback: monthAgo === 0
                    ? "Great improvement in consistency! Speed scores are up significantly."
                    : "Good effort this month. Focus more on landing mechanics.",

                strengths: JSON.stringify(['Agility', 'Rhythm']),
                improvements: JSON.stringify(['Power jumps', 'Transitions']),
                goals: JSON.stringify(['Reach 100 speed steps', 'Master double under cross']),

                status: 'PUBLISHED'
            }
        })
    }

    // 4. Create Milestones
    await prisma.skillMilestone.create({
        data: {
            studentId: student.id,
            milestoneType: 'SPEED_THRESHOLD',
            title: 'Speed Demon',
            description: 'Reach 90 jumps per minute',
            targetValue: 90,
            achievedValue: 92,
            unit: 'jpm',
            isAchieved: true,
            achievedDate: new Date(),
            badge: '⚡',
            points: 100
        }
    })

    await prisma.skillMilestone.create({
        data: {
            studentId: student.id,
            milestoneType: 'ENDURANCE_GOAL',
            title: 'Marathon Jumper',
            description: 'Jump for 5 minutes continuously',
            targetValue: 5,
            achievedValue: 4,
            unit: 'min',
            isAchieved: false,
            points: 200
        }
    })

    console.log('✅ Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
