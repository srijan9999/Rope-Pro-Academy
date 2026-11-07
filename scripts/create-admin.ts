import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const name = process.env.ADMIN_NAME?.trim()
    const password = process.env.ADMIN_PASSWORD

    if (!email || !name || !password) {
        console.error("❌ Missing required environment variables: ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD")
        process.exit(1)
    }

    if (!email.includes("@") || !email.includes(".")) {
        console.error("❌ Invalid ADMIN_EMAIL format")
        process.exit(1)
    }

    if (password.length < 12) {
        console.error("❌ ADMIN_PASSWORD must be at least 12 characters long")
        process.exit(1)
    }

    console.log(`🔒 Hashing admin password with bcrypt (cost: 12)...`)
    const hashedPassword = await bcrypt.hash(password, 12)

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true },
    })

    if (existingUser) {
        console.error(`❌ User with email '${email}' already exists with role '${existingUser.role}'`)
        process.exit(1)
    }

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            mustChangePassword: false,
            emailVerified: new Date(),
            admin: {
                create: {
                    fullName: name,
                    phone: "+91-0000000000",
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
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
        },
    })

    console.log(`✅ Admin account created successfully!`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email:   ${user.email}`)
    console.log(`   Role:    ${user.role}`)
}

main()
    .catch((err) => {
        console.error("❌ Error creating admin user:", err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
