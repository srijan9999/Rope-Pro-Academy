import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting database seeding...")

    // ============================================
    // 1. CREATE DEFAULT ADMIN USER
    // ============================================
    console.log("Creating admin user...")

    const hashedPassword = await bcrypt.hash("Admin@123", 12)

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@roproacademy.com" },
        update: {},
        create: {
            email: "admin@roproacademy.com",
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            emailVerified: new Date(),
            admin: {
                create: {
                    fullName: "System Administrator",
                    phone: "+91-9999999999",
                    permissions: JSON.stringify({
                        users: ["create", "read", "update", "delete"],
                        students: ["create", "read", "update", "delete"],
                        coaches: ["create", "read", "update", "delete"],
                        academies: ["create", "read", "update", "delete"],
                        events: ["create", "read", "update", "delete"],
                        fees: ["create", "read", "update", "delete"],
                        reports: ["read"],
                        settings: ["read", "update"],
                    }),
                },
            },
        },
    })

    console.log(`✅ Admin user created: ${adminUser.email}`)

    // ============================================
    // 1B. CREATE DEMO COACH USER
    // ============================================
    console.log("Creating demo coach user...")

    const coachPassword = await bcrypt.hash("Coach@123", 12)

    const coachUser = await prisma.user.upsert({
        where: { email: "coach@roproacademy.com" },
        update: {},
        create: {
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
                    certifications: JSON.stringify(["National Level Certified Coach", "First Aid Certified", "Child Safety Training"]),
                    qualifications: "Experienced rope skipping coach with passion for teaching students of all ages. Specializing in both competitive and recreational training.",
                },
            },
        },
    })

    console.log(`✅ Demo coach created: ${coachUser.email}`)

    // ============================================
    // 1C. CREATE DEMO STUDENT USER
    // ============================================
    console.log("Creating demo student user...")

    const studentPassword = await bcrypt.hash("Student@123", 12)

    const studentUser = await prisma.user.upsert({
        where: { email: "student@roproacademy.com" },
        update: {},
        create: {
            email: "student@roproacademy.com",
            password: studentPassword,
            role: "STUDENT",
            status: "ACTIVE",
            emailVerified: new Date(),
            student: {
                create: {
                    studentId: "STU-DEMO-001",
                    fullName: "Demo Student",
                    dateOfBirth: new Date("2012-05-15"),
                    gender: "MALE",
                    phone: "+91-7777777777",
                    schoolName: "Demo Public School",
                    parentName: "Demo Parent",
                    parentPhone: "+91-9876543210",
                    parentEmail: "parent@example.com",
                    bloodGroup: "O+",
                    emergencyContact: "Demo Parent - 9876543210",
                    skillLevel: "BEGINNER",
                },
            },
        },
    })

    console.log(`✅ Demo student created: ${studentUser.email}`)

    // ============================================
    // 2. CREATE ACADEMIES (4 LOCATIONS)
    // ============================================
    console.log("Creating academies...")

    const academies = await Promise.all([
        prisma.academy.upsert({
            where: { id: "academy-rohini" },
            update: {},
            create: {
                id: "academy-rohini",
                name: "Bal Bharati Public School - Rohini",
                address: "Sector 14, Rohini, Delhi - 110085",
                locationLat: 28.7345,
                locationLng: 77.1234,
                contactPhone: "+91-11-27561234",
                contactEmail: "rohini@roproacademy.com",
                operatingHours: JSON.stringify({
                    weekdays: "6:00 AM - 8:00 PM",
                    weekends: "7:00 AM - 6:00 PM",
                }),
                facilities: JSON.stringify([
                    "Indoor Training Area",
                    "Professional Equipment",
                    "Water Facilities",
                    "Changing Rooms",
                    "First Aid",
                ]),
                capacity: 100,
                status: "ACTIVE",
            },
        }),
        prisma.academy.upsert({
            where: { id: "academy-vikaspuri" },
            update: {},
            create: {
                id: "academy-vikaspuri",
                name: "Adarsh Public School - Vikaspuri",
                address: "Block A, Vikaspuri, Delhi - 110018",
                locationLat: 28.6456,
                locationLng: 77.0789,
                contactPhone: "+91-11-25671234",
                contactEmail: "vikaspuri@roproacademy.com",
                operatingHours: JSON.stringify({
                    weekdays: "6:00 AM - 8:00 PM",
                    weekends: "8:00 AM - 5:00 PM",
                }),
                facilities: JSON.stringify([
                    "Indoor Training Area",
                    "Professional Equipment",
                    "Water Facilities",
                ]),
                capacity: 80,
                status: "ACTIVE",
            },
        }),
        prisma.academy.upsert({
            where: { id: "academy-mohan-garden" },
            update: {},
            create: {
                id: "academy-mohan-garden",
                name: "Mohan Garden Training Center",
                address: "Near Metro Station, Mohan Garden, Delhi - 110059",
                locationLat: 28.6234,
                locationLng: 77.0456,
                contactPhone: "+91-11-28901234",
                contactEmail: "mohangarden@roproacademy.com",
                operatingHours: JSON.stringify({
                    weekdays: "5:30 AM - 8:30 PM",
                    weekends: "7:00 AM - 6:00 PM",
                }),
                facilities: JSON.stringify([
                    "Outdoor Training Area",
                    "Basic Equipment",
                    "Water Facilities",
                ]),
                capacity: 60,
                status: "ACTIVE",
            },
        }),
        prisma.academy.upsert({
            where: { id: "academy-dwarka" },
            update: {},
            create: {
                id: "academy-dwarka",
                name: "Dwarka Sports Complex",
                address: "Sector 12, Dwarka, Delhi - 110075",
                locationLat: 28.5912,
                locationLng: 77.0234,
                contactPhone: "+91-11-25891234",
                contactEmail: "dwarka@roproacademy.com",
                operatingHours: JSON.stringify({
                    weekdays: "6:00 AM - 9:00 PM",
                    weekends: "7:00 AM - 7:00 PM",
                }),
                facilities: JSON.stringify([
                    "Indoor Training Area",
                    "Professional Equipment",
                    "Water Facilities",
                    "Parking",
                    "AC Hall",
                ]),
                capacity: 120,
                status: "ACTIVE",
            },
        }),
    ])

    console.log(`✅ Created ${academies.length} academies`)

    // ============================================
    // 3. CREATE SAMPLE BATCHES
    // ============================================
    console.log("Creating sample batches...")

    const batches = await Promise.all([
        // Rohini batches
        prisma.batch.upsert({
            where: { id: "batch-rohini-beginners-morning" },
            update: {},
            create: {
                id: "batch-rohini-beginners-morning",
                name: "Beginners Morning Batch",
                description: "For new students aged 6-10 years",
                academyId: "academy-rohini",
                skillLevel: "BEGINNER",
                minAge: 6,
                maxAge: 10,
                maxCapacity: 20,
                daysOfWeek: JSON.stringify(["Monday", "Wednesday", "Friday"]),
                startTime: "06:00",
                endTime: "07:30",
                monthlyFee: 2000,
                status: "ACTIVE",
            },
        }),
        prisma.batch.upsert({
            where: { id: "batch-rohini-intermediate-evening" },
            update: {},
            create: {
                id: "batch-rohini-intermediate-evening",
                name: "Intermediate Evening Batch",
                description: "For students with 6+ months experience",
                academyId: "academy-rohini",
                skillLevel: "INTERMEDIATE",
                minAge: 8,
                maxAge: 14,
                maxCapacity: 15,
                daysOfWeek: JSON.stringify(["Tuesday", "Thursday", "Saturday"]),
                startTime: "17:00",
                endTime: "18:30",
                monthlyFee: 2500,
                status: "ACTIVE",
            },
        }),
        prisma.batch.upsert({
            where: { id: "batch-rohini-competitive" },
            update: {},
            create: {
                id: "batch-rohini-competitive",
                name: "Competitive Training",
                description: "For competition-level athletes",
                academyId: "academy-rohini",
                skillLevel: "COMPETITIVE",
                minAge: 10,
                maxAge: 18,
                maxCapacity: 10,
                daysOfWeek: JSON.stringify([
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                ]),
                startTime: "05:30",
                endTime: "07:00",
                monthlyFee: 4000,
                status: "ACTIVE",
            },
        }),
        // Dwarka batches
        prisma.batch.upsert({
            where: { id: "batch-dwarka-beginners" },
            update: {},
            create: {
                id: "batch-dwarka-beginners",
                name: "Dwarka Beginners",
                description: "Beginner friendly batch",
                academyId: "academy-dwarka",
                skillLevel: "BEGINNER",
                minAge: 5,
                maxAge: 12,
                maxCapacity: 25,
                daysOfWeek: JSON.stringify(["Monday", "Wednesday", "Friday"]),
                startTime: "17:30",
                endTime: "19:00",
                monthlyFee: 1800,
                status: "ACTIVE",
            },
        }),
    ])

    console.log(`✅ Created ${batches.length} batches`)

    // ============================================
    // 4. CREATE SYSTEM SETTINGS
    // ============================================
    console.log("Creating system settings...")

    const settings = await Promise.all([
        prisma.systemSettings.upsert({
            where: { key: "registration_open" },
            update: {},
            create: {
                key: "registration_open",
                value: "true",
                category: "GENERAL",
                description: "Whether new student registrations are accepted",
                isPublic: true,
            },
        }),
        prisma.systemSettings.upsert({
            where: { key: "late_fee_percentage" },
            update: {},
            create: {
                key: "late_fee_percentage",
                value: "10",
                category: "FEE",
                description: "Late fee percentage after due date",
                isPublic: false,
            },
        }),
        prisma.systemSettings.upsert({
            where: { key: "grace_period_days" },
            update: {},
            create: {
                key: "grace_period_days",
                value: "7",
                category: "FEE",
                description: "Number of days before late fee applies",
                isPublic: false,
            },
        }),
        prisma.systemSettings.upsert({
            where: { key: "email_notifications_enabled" },
            update: {},
            create: {
                key: "email_notifications_enabled",
                value: "true",
                category: "NOTIFICATION",
                description: "Enable email notifications for important events",
                isPublic: false,
            },
        }),
        prisma.systemSettings.upsert({
            where: { key: "academy_name" },
            update: {},
            create: {
                key: "academy_name",
                value: "Rope Pro Academy",
                category: "GENERAL",
                description: "Official academy name",
                isPublic: true,
            },
        }),
        prisma.systemSettings.upsert({
            where: { key: "tagline" },
            update: {},
            create: {
                key: "tagline",
                value: "Jump Into Excellence",
                category: "GENERAL",
                description: "Academy tagline",
                isPublic: true,
            },
        }),
    ])

    console.log(`✅ Created ${settings.length} system settings`)

    console.log("🎉 Database seeding completed successfully!")
    console.log("")
    console.log("📋 Summary:")
    console.log("   - 1 Admin user (admin@roproacademy.com / Admin@123)")
    console.log("   - 1 Demo Coach (coach@roproacademy.com / Coach@123)")
    console.log("   - 1 Demo Student (student@roproacademy.com / Student@123)")
    console.log("   - 4 Academy locations")
    console.log("   - 4 Sample batches")
    console.log("   - 6 System settings")
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
