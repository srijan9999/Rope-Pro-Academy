import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

function getNormalizedEndpointId(dbUrlStr: string): string {
    const match = dbUrlStr.match(/ep-[a-z0-9-]+/)
    if (!match) return ""
    return match[0].replace(/-pooler$/, "")
}

function verifyHostGuard(): void {
    const dbUrl = process.env.LIVE_DATABASE_URL || process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("❌ ERROR: Neither LIVE_DATABASE_URL nor DATABASE_URL is set.")
        process.exit(1)
    }

    const actualEndpoint = getNormalizedEndpointId(dbUrl)
    // Allow non-Neon connections (e.g. localhost) without endpoint check
    if (!actualEndpoint) return

    const confirmed = (process.env.CONFIRM_DB_HOST || process.env.CONFIRM_ENDPOINT_ID)?.trim()
    const confirmedNorm = confirmed ? (getNormalizedEndpointId(confirmed) || confirmed) : ""

    if (!confirmedNorm) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST is not set.\n` +
            `Please run with CONFIRM_DB_HOST="${actualEndpoint}" to verify target database.`
        )
        process.exit(1)
    }

    if (confirmedNorm !== actualEndpoint) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST ('${confirmedNorm}') does not match actual endpoint ('${actualEndpoint}'). Aborting.`
        )
        process.exit(1)
    }
}

async function generateStudentId(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `RPA-${year}-`

    const lastStudent = await prisma.student.findFirst({
        where: {
            studentId: {
                startsWith: prefix,
            },
        },
        orderBy: {
            studentId: "desc",
        },
        select: {
            studentId: true,
        },
    })

    let nextNumber = 1
    if (lastStudent) {
        const parts = lastStudent.studentId.split("-")
        if (parts.length >= 3) {
            const lastNumber = parseInt(parts[2], 10)
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1
            }
        }
    }

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
}

async function main() {
    verifyHostGuard()

    const email = (process.env.STUDENT_EMAIL || "student.test@ropeproacademy.com").trim().toLowerCase()
    const name = (process.env.STUDENT_NAME || "Demo Student").trim()
    const password = process.env.STUDENT_PASSWORD

    if (!password) {
        console.error("❌ Missing required environment variable: STUDENT_PASSWORD")
        console.error("Usage:")
        console.error('  $env:CONFIRM_DB_HOST = "<endpoint-id>"')
        console.error('  $env:STUDENT_EMAIL = "student.test@ropeproacademy.com"')
        console.error('  $env:STUDENT_PASSWORD = "<secure-password>"')
        console.error('  npx tsx scripts/create-student.ts')
        process.exit(1)
    }

    if (password.length < 8) {
        console.error("❌ STUDENT_PASSWORD must be at least 8 characters long")
        process.exit(1)
    }

    if (!email.includes("@") || !email.includes(".")) {
        console.error("❌ Invalid STUDENT_EMAIL format")
        process.exit(1)
    }

    console.log(`🔒 Hashing student password with bcrypt (cost: 12)...`)
    const hashedPassword = await bcrypt.hash(password, 12)

    const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { student: true },
    })

    if (existingUser) {
        if (existingUser.role !== "STUDENT") {
            console.error(`❌ User with email '${email}' exists with role '${existingUser.role}'. Cannot convert to STUDENT.`)
            process.exit(1)
        }

        console.log(`ℹ️ Existing student user found. Updating password and ensuring ACTIVE status...`)
        const updated = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                password: hashedPassword,
                status: "ACTIVE",
                mustChangePassword: false,
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                student: {
                    select: {
                        studentId: true,
                        fullName: true,
                    },
                },
            },
        })

        console.log(`\n✅ Student account updated and activated successfully!`)
        console.log(`   User ID:    ${updated.id}`)
        console.log(`   Email:      ${updated.email}`)
        console.log(`   Student ID: ${updated.student?.studentId || "N/A"}`)
        console.log(`   Name:       ${updated.student?.fullName || name}`)
        console.log(`   Role:       ${updated.role}`)
        console.log(`   Status:     ${updated.status}`)
        return
    }

    const studentId = await generateStudentId()

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: "STUDENT",
            status: "ACTIVE",
            mustChangePassword: false,
            emailVerified: new Date(),
            student: {
                create: {
                    studentId,
                    fullName: name,
                    schoolName: "Rope Pro Academy",
                    skillLevel: "BEGINNER",
                    status: "VERIFIED",
                    registrationStatus: "VERIFIED",
                    gateAccess: true,
                },
            },
        },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            student: {
                select: {
                    studentId: true,
                    fullName: true,
                },
            },
        },
    })

    console.log(`\n✅ Student account created successfully!`)
    console.log(`   User ID:    ${newUser.id}`)
    console.log(`   Email:      ${newUser.email}`)
    console.log(`   Student ID: ${newUser.student?.studentId}`)
    console.log(`   Name:       ${newUser.student?.fullName}`)
    console.log(`   Role:       ${newUser.role}`)
    console.log(`   Status:     ${newUser.status}`)
}

main()
    .catch((err) => {
        console.error("❌ Error creating student account:", err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
