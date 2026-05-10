/**
 * Coach Portal Seed Script
 * Run with: npx ts-node scripts/seed-coach-portal.ts
 * 
 * This script enhances the existing demo coach with:
 * - Assigned batches
 * - Students in those batches
 * - Attendance records
 * - Progress reports
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
    console.log("🏃 Starting Coach Portal seed...")

    // 1. Find or create demo coach
    let coachUser = await prisma.user.findUnique({
        where: { email: "coach@roproacademy.com" },
        include: { coach: true }
    })

    if (!coachUser) {
        console.log("Creating demo coach...")
        const coachPassword = await bcrypt.hash("Coach@123", 12)
        coachUser = await prisma.user.create({
            data: {
                email: "coach@roproacademy.com",
                password: coachPassword,
                role: "COACH",
                status: "ACTIVE",
                emailVerified: new Date(),
                coach: {
                    create: {
                        coachId: "COACH-DEMO-001",
                        fullName: "Demo Coach",
                        phone: "+91-8888888888",
                        primarySpecialization: "FITNESS",
                        experienceYears: 7,
                        coachingYears: 5,
                        certifications: JSON.stringify([
                            "National Level Certified Coach",
                            "First Aid Certified",
                            "Child Safety Training"
                        ]),
                        qualifications: "Experienced rope skipping coach",
                    },
                },
            },
            include: { coach: true }
        })
    }

    const coachId = coachUser.coach!.id
    console.log(`✅ Coach ready: ${coachUser.email} (${coachId})`)

    // 2. Ensure academies exist
    const rohiniAcademy = await prisma.academy.upsert({
        where: { id: "academy-rohini" },
        update: {},
        create: {
            id: "academy-rohini",
            name: "Bal Bharati Public School - Rohini",
            address: "Sector 14, Rohini, Delhi - 110085",
            location: "Rohini, Delhi",
            contactPhone: "+91-11-27561234",
            contactEmail: "rohini@roproacademy.com",
            capacity: 100,
            status: "ACTIVE",
        },
    })

    console.log(`✅ Academy ready: ${rohiniAcademy.name}`)

    // 3. Create/Update batches and assign to coach
    const batch1 = await prisma.batch.upsert({
        where: { id: "batch-rohini-beginners-morning" },
        update: {
            coachId: coachId,
            code: "RBM-2025",
            ageGroup: "KIDS_8_11",
            batchType: "BEGINNER",
            totalSessions: 48,
            completedSessions: 12,
            sessionsPerWeek: 3,
            currentStrength: 8,
        },
        create: {
            id: "batch-rohini-beginners-morning",
            name: "Beginners Morning Batch",
            code: "RBM-2025",
            description: "For new students aged 6-10 years",
            academyId: rohiniAcademy.id,
            coachId: coachId,
            skillLevel: "BEGINNER",
            ageGroup: "KIDS_8_11",
            batchType: "BEGINNER",
            minAge: 6,
            maxAge: 10,
            maxCapacity: 20,
            currentStrength: 8,
            daysOfWeek: JSON.stringify(["Monday", "Wednesday", "Friday"]),
            startTime: "06:00",
            endTime: "07:30",
            monthlyFee: 2000,
            totalSessions: 48,
            completedSessions: 12,
            sessionsPerWeek: 3,
            status: "ACTIVE",
        },
    })

    const batch2 = await prisma.batch.upsert({
        where: { id: "batch-rohini-intermediate-evening" },
        update: {
            coachId: coachId,
            code: "RIE-2025",
            ageGroup: "TEENS_12_15",
            batchType: "REGULAR",
            totalSessions: 48,
            completedSessions: 15,
            sessionsPerWeek: 3,
            currentStrength: 6,
        },
        create: {
            id: "batch-rohini-intermediate-evening",
            name: "Intermediate Evening Batch",
            code: "RIE-2025",
            description: "For students with 6+ months experience",
            academyId: rohiniAcademy.id,
            coachId: coachId,
            skillLevel: "INTERMEDIATE",
            ageGroup: "TEENS_12_15",
            batchType: "REGULAR",
            minAge: 8,
            maxAge: 14,
            maxCapacity: 15,
            currentStrength: 6,
            daysOfWeek: JSON.stringify(["Tuesday", "Thursday", "Saturday"]),
            startTime: "17:00",
            endTime: "18:30",
            monthlyFee: 2500,
            totalSessions: 48,
            completedSessions: 15,
            sessionsPerWeek: 3,
            status: "ACTIVE",
        },
    })

    console.log(`✅ Batches assigned to coach: ${batch1.name}, ${batch2.name}`)

    // 4. Create sample students for batch 1
    const studentNames = [
        { name: "Aarav Gupta", gender: "MALE", dob: "2015-03-12" },
        { name: "Zara Khan", gender: "FEMALE", dob: "2014-08-25" },
        { name: "Vihaan Patel", gender: "MALE", dob: "2015-11-05" },
        { name: "Ishaan Kumar", gender: "MALE", dob: "2016-01-18" },
        { name: "Ananya Sharma", gender: "FEMALE", dob: "2014-05-30" },
        { name: "Rohan Singh", gender: "MALE", dob: "2015-07-22" },
        { name: "Meera Reddy", gender: "FEMALE", dob: "2014-12-08" },
        { name: "Dev Malhotra", gender: "MALE", dob: "2015-09-14" },
    ]

    const studentPassword = await bcrypt.hash("Student@123", 12)

    for (let i = 0; i < studentNames.length; i++) {
        const s = studentNames[i]
        const email = `student${i + 1}@demo.com`
        const studentId = `STU-DEV-${String(i + 1).padStart(3, "0")}`

        // Random attendance (60-100%)
        const attendancePercentage = Math.floor(Math.random() * 41) + 60
        // Random streak (0-10)
        const consecutivePresent = Math.floor(Math.random() * 11)
        // Random performance (50-95)
        const lastAssessmentScore = Math.floor(Math.random() * 46) + 50

        await prisma.user.upsert({
            where: { email },
            update: {
                student: {
                    update: {
                        batchId: batch1.id,
                        academyId: rohiniAcademy.id,
                        attendancePercentage,
                        consecutivePresent,
                        longestStreak: consecutivePresent + Math.floor(Math.random() * 5),
                        lastAssessmentScore,
                        lastAttendanceDate: new Date(),
                        lastAttendanceStatus: consecutivePresent > 0 ? "PRESENT" : "ABSENT",
                    }
                }
            },
            create: {
                email,
                password: studentPassword,
                role: "STUDENT",
                status: "ACTIVE",
                emailVerified: new Date(),
                student: {
                    create: {
                        studentId,
                        fullName: s.name,
                        dateOfBirth: new Date(s.dob),
                        gender: s.gender,
                        phone: `+91-${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                        parentName: `Parent of ${s.name}`,
                        parentPhone: `+91-${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                        skillLevel: "BEGINNER",
                        batchId: batch1.id,
                        academyId: rohiniAcademy.id,
                        attendancePercentage,
                        consecutivePresent,
                        longestStreak: consecutivePresent + Math.floor(Math.random() * 5),
                        lastAssessmentScore,
                        lastAttendanceDate: new Date(),
                        lastAttendanceStatus: consecutivePresent > 0 ? "PRESENT" : "ABSENT",
                    }
                }
            }
        })
    }

    console.log(`✅ Created ${studentNames.length} students in ${batch1.name}`)

    // 5. Create sample students for batch 2
    const intermediateStudents = [
        { name: "Arjun Verma", gender: "MALE", dob: "2011-04-15" },
        { name: "Priya Kapoor", gender: "FEMALE", dob: "2010-09-22" },
        { name: "Karan Malhotra", gender: "MALE", dob: "2012-02-08" },
        { name: "Simran Gill", gender: "FEMALE", dob: "2011-11-30" },
        { name: "Rahul Joshi", gender: "MALE", dob: "2010-06-17" },
        { name: "Neha Agarwal", gender: "FEMALE", dob: "2012-08-25" },
    ]

    for (let i = 0; i < intermediateStudents.length; i++) {
        const s = intermediateStudents[i]
        const email = `intermediate${i + 1}@demo.com`
        const studentId = `STU-INT-${String(i + 1).padStart(3, "0")}`

        const attendancePercentage = Math.floor(Math.random() * 26) + 75 // 75-100%
        const consecutivePresent = Math.floor(Math.random() * 15)
        const lastAssessmentScore = Math.floor(Math.random() * 31) + 65 // 65-95

        await prisma.user.upsert({
            where: { email },
            update: {
                student: {
                    update: {
                        batchId: batch2.id,
                        academyId: rohiniAcademy.id,
                        attendancePercentage,
                        consecutivePresent,
                        longestStreak: consecutivePresent + Math.floor(Math.random() * 5),
                        lastAssessmentScore,
                        lastAttendanceDate: new Date(),
                        lastAttendanceStatus: "PRESENT",
                    }
                }
            },
            create: {
                email,
                password: studentPassword,
                role: "STUDENT",
                status: "ACTIVE",
                emailVerified: new Date(),
                student: {
                    create: {
                        studentId,
                        fullName: s.name,
                        dateOfBirth: new Date(s.dob),
                        gender: s.gender,
                        phone: `+91-${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                        parentName: `Parent of ${s.name}`,
                        parentPhone: `+91-${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                        skillLevel: "INTERMEDIATE",
                        batchId: batch2.id,
                        academyId: rohiniAcademy.id,
                        attendancePercentage,
                        consecutivePresent,
                        longestStreak: consecutivePresent + Math.floor(Math.random() * 5),
                        lastAssessmentScore,
                        lastAttendanceDate: new Date(),
                        lastAttendanceStatus: "PRESENT",
                    }
                }
            }
        })
    }

    console.log(`✅ Created ${intermediateStudents.length} students in ${batch2.name}`)

    // 6. Create progress reports for some students
    const studentsWithReports = await prisma.student.findMany({
        where: { batchId: { in: [batch1.id, batch2.id] } },
        take: 6
    })

    for (const student of studentsWithReports) {
        await prisma.progressReport.upsert({
            where: {
                id: `report-${student.id}-latest`
            },
            update: {},
            create: {
                id: `report-${student.id}-latest`,
                studentId: student.id,
                coachId: coachId,
                assessmentType: "REGULAR",
                currentLevel: student.skillLevel || "BEGINNER",
                speed: Math.floor(Math.random() * 60) + 80, // 80-140 jumps/min
                endurance: Math.floor(Math.random() * 4) + 2, // 2-6 minutes
                freestyle: Math.floor(Math.random() * 10) + 3, // 3-12 tricks
                doubleUnders: Math.floor(Math.random() * 20) + 5, // 5-25 consecutive
                speedScore: Math.floor(Math.random() * 30) + 70,
                enduranceScore: Math.floor(Math.random() * 30) + 70,
                freestyleScore: Math.floor(Math.random() * 40) + 60,
                doubleUndersScore: Math.floor(Math.random() * 40) + 60,
                techniqueScore: Math.floor(Math.random() * 30) + 70,
                overallScore: student.lastAssessmentScore || 75,
                performanceGrade: student.lastAssessmentScore && student.lastAssessmentScore >= 85 ? "A" :
                    student.lastAssessmentScore && student.lastAssessmentScore >= 75 ? "B_PLUS" : "B",
                improvement: Math.floor(Math.random() * 15) - 3, // -3 to +12
                feedback: "Good progress! Keep practicing the fundamentals.",
                strengths: JSON.stringify(["Consistency", "Enthusiasm"]),
                improvements: JSON.stringify(["Speed", "Form"]),
                goals: JSON.stringify(["Master double unders", "Improve endurance"]),
                status: "PUBLISHED",
            }
        })
    }

    console.log(`✅ Created progress reports for ${studentsWithReports.length} students`)

    console.log("")
    console.log("🎉 Coach Portal seed completed!")
    console.log("")
    console.log("📋 Test Data Created:")
    console.log("   Coach: coach@roproacademy.com / Coach@123")
    console.log(`   Batch 1: ${batch1.name} (${studentNames.length} students)`)
    console.log(`   Batch 2: ${batch2.name} (${intermediateStudents.length} students)`)
    console.log("")
    console.log("🚀 Navigate to /dashboard/coach to test!")
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
