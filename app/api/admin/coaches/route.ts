import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { authOptions, generateCoachId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashDefaultPassword } from "@/lib/default-password"

const createCoachSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    resumeUrl: z.string().optional(),
})

export async function POST(req: Request) {
    // 1. Admin-only, enforced on the server
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // 2. Validate input
    const body = await req.json().catch(() => null)
    const parsed = createCoachSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0].message },
            { status: 400 }
        )
    }
    const { fullName, email, phone, resumeUrl } = parsed.data

    // 3. Hash the default password (throws if DEFAULT_TEMP_PASSWORD is not set)
    const hashedPassword = await hashDefaultPassword()

    // 4. Create user + coach profile atomically
    try {
        const coachId = await generateCoachId()

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: "COACH",
                status: "ACTIVE",
                mustChangePassword: true, // forces the change on first login
                coach: {
                    create: {
                        coachId,
                        fullName: fullName.trim(),
                        email: email.toLowerCase().trim(),
                        phone: phone.trim(),
                        resumeUrl: resumeUrl || "",
                        applicationStatus: "APPROVED",
                        isApproved: true,
                    },
                },
            },
            select: { id: true, email: true, role: true, mustChangePassword: true },
        })

        return NextResponse.json({ success: true, user }, { status: 201 })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return NextResponse.json(
                { message: "An account with this email already exists" },
                { status: 409 }
            )
        }
        console.error("Error creating coach:", err)
        return NextResponse.json({ message: "Could not create coach" }, { status: 500 })
    }
}
