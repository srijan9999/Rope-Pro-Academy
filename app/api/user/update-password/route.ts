import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updatePasswordSchema } from "@/lib/validations/password"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const parsed = updatePasswordSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.issues[0].message },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true, mustChangePassword: true },
    })

    if (!user?.password) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // This endpoint only works for accounts flagged with mustChangePassword = true
    if (!user.mustChangePassword) {
        return NextResponse.json(
            { message: "A password change is not required for this account" },
            { status: 403 }
        )
    }

    // Block reusing the temporary password (current hash == the default one)
    const sameAsCurrent = await bcrypt.compare(parsed.data.newPassword, user.password)
    if (sameAsCurrent) {
        return NextResponse.json(
            { message: "Choose a password different from the temporary one" },
            { status: 400 }
        )
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12)

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            password: hashed,
            mustChangePassword: false,
        },
    })

    return NextResponse.json({ success: true })
}
