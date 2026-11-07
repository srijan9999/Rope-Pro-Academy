import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { studentRegistrationSchema } from "@/lib/validations/registration"
import { getFee } from "@/lib/pricing"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null)
        if (!body) {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
        }

        // 1. Validate input strictly with Zod
        const validation = studentRegistrationSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const data = validation.data

        // 2. Compute fee amount STRICTLY on the server (ignore any client fee)
        const feeAmount = getFee(data.school, data.plan)
        if (feeAmount == null || feeAmount <= 0) {
            return NextResponse.json(
                { message: "Invalid academy centre or plan selected" },
                { status: 400 }
            )
        }

        const emailLower = data.email.toLowerCase().trim()
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Common student profile fields
        const studentFields = {
            fullName: data.fullName.trim(),
            dateOfBirth: data.dob ? new Date(data.dob) : null,
            gender: data.gender.toUpperCase(),
            phone: data.phone.trim(),
            schoolName: data.schoolName.trim(), // Regular school
            grade: data.grade?.trim() || null,
            parentName: data.parentName.trim(),
            parentRelation: data.parentRelation.trim(),
            parentPhone: data.parentPhone.trim(),
            parentEmail: data.parentEmail?.trim() || null,
            bloodGroup: data.bloodGroup.trim(),
            medicalConditions: data.medicalConditions?.trim() || null,
            emergencyContact: data.emergencyContact.trim(),
            emergencyPhone: data.emergencyPhone.trim(),
            skillLevel: data.experienceLevel,

            // Location-based pricing & status
            school: data.school,
            selectedPlan: data.plan,
            feeAmount,
            status: "PENDING_PAYMENT" as const,
            registrationStatus: "UNPAID",
            paymentRejectionNote: null,
            utrNumber: null,
        }

        // 3. Check for existing record
        const existingUser = await prisma.user.findUnique({
            where: { email: emailLower },
            include: { student: true },
        })

        if (existingUser) {
            // Check if already active or awaiting verification
            if (
                existingUser.status === "ACTIVE" ||
                existingUser.student?.status === "ACTIVE" ||
                existingUser.student?.status === "PENDING_VERIFICATION"
            ) {
                return NextResponse.json(
                    {
                        message:
                            "An account with this email is already active or awaiting payment verification.",
                    },
                    { status: 409 }
                )
            }

            // If existing is PENDING_PAYMENT or PAYMENT_REJECTED, update it (including recomputing feeAmount)
            if (existingUser.student) {
                const updated = await prisma.$transaction(async (tx) => {
                    await tx.user.update({
                        where: { id: existingUser.id },
                        data: {
                            password: hashedPassword,
                            status: "PENDING_PAYMENT",
                        },
                    })

                    const updatedStudent = await tx.student.update({
                        where: { id: existingUser.student!.id },
                        data: studentFields,
                        select: { id: true },
                    })

                    return updatedStudent
                })

                return NextResponse.json({ success: true, userId: updated.id }, { status: 200 })
            }
        }

        // 4. New Registration: Create User + Student in transaction
        const year = new Date().getFullYear()
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const studentId = `RPA-${year}-${randomNum}`

        const created = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: emailLower,
                    password: hashedPassword,
                    role: "STUDENT",
                    status: "PENDING_PAYMENT",
                },
                select: { id: true },
            })

            const student = await tx.student.create({
                data: {
                    ...studentFields,
                    studentId,
                    userId: user.id,
                },
                select: { id: true },
            })

            return student
        })

        return NextResponse.json({ success: true, userId: created.id }, { status: 201 })
    } catch (err) {
        console.error("Registration error:", err)
        return NextResponse.json({ message: "Could not complete registration" }, { status: 500 })
    }
}
