import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import { updateAcademySchema } from "@/lib/validations/academy"

// GET - Fetch single academy with details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const { id } = await params

        const academy = await prisma.academy.findUnique({
            where: { id },
            include: {
                headCoach: {
                    select: {
                        id: true,
                        coachId: true,
                        fullName: true,
                        photoUrl: true,
                        primarySpecialization: true,
                        phone: true,
                        email: true
                    }
                },
                students: {
                    select: {
                        id: true,
                        studentId: true,
                        fullName: true,
                        photoUrl: true,
                        skillLevel: true,
                        batch: { select: { name: true } }
                    },
                    take: 50,
                    orderBy: { fullName: 'asc' }
                },
                batches: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        startTime: true,
                        endTime: true,
                        currentStrength: true,
                        maxCapacity: true,
                        status: true
                    }
                },
                _count: {
                    select: {
                        students: true,
                        batches: true
                    }
                }
            }
        })

        if (!academy) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Academy not found' } },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: { academy },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("❌ ACADEMY GET ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch academy' } },
            { status: 500 }
        )
    }
}

// PATCH - Update academy
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const { id } = await params

        // Verify academy exists
        const existingAcademy = await prisma.academy.findUnique({
            where: { id },
            include: { headCoach: true, _count: { select: { students: true } } }
        })

        if (!existingAcademy) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Academy not found' } },
                { status: 404 }
            )
        }

        // Parse and validate input
        const body = await request.json()
        const validationResult = updateAcademySchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationResult.error.flatten().fieldErrors
                    }
                },
                { status: 400 }
            )
        }

        const data = validationResult.data
        console.log("🏫 ACADEMY - Updating:", id, data)

        // Check name uniqueness if updating
        if (data.name && data.name !== existingAcademy.name) {
            const duplicateName = await prisma.academy.findFirst({
                where: { name: data.name, id: { not: id } }
            })

            if (duplicateName) {
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: 'DUPLICATE_NAME', message: `Academy "${data.name}" already exists` }
                    },
                    { status: 409 }
                )
            }
        }

        // Check email uniqueness if updating
        if (data.contactEmail && data.contactEmail !== existingAcademy.contactEmail) {
            const duplicateEmail = await prisma.academy.findFirst({
                where: { contactEmail: data.contactEmail, id: { not: id } }
            })

            if (duplicateEmail) {
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: 'DUPLICATE_EMAIL', message: `Email ${data.contactEmail} is already in use` }
                    },
                    { status: 409 }
                )
            }
        }

        // Validate head coach if changing
        if (data.headCoachId !== undefined && data.headCoachId !== existingAcademy.headCoachId) {
            if (data.headCoachId) {
                const coach = await prisma.coach.findUnique({
                    where: { id: data.headCoachId },
                    include: { headOfAcademy: true }
                })

                if (!coach) {
                    return NextResponse.json(
                        { success: false, error: { code: 'COACH_NOT_FOUND', message: 'Selected coach does not exist' } },
                        { status: 404 }
                    )
                }

                if (coach.headOfAcademy && coach.headOfAcademy.id !== id) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                code: 'COACH_ALREADY_HEAD',
                                message: `This coach is already head of "${coach.headOfAcademy.name}"`
                            }
                        },
                        { status: 409 }
                    )
                }
            }
        }

        // Validate capacity if reducing
        if (data.capacity !== undefined && data.capacity < existingAcademy._count.students) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'CAPACITY_TOO_LOW',
                        message: `Cannot reduce capacity below current student count (${existingAcademy._count.students})`
                    }
                },
                { status: 400 }
            )
        }

        // Build update data
        const updateData: Record<string, unknown> = { ...data }
        if (data.operatingHours) {
            updateData.operatingHours = JSON.stringify(data.operatingHours)
        }
        if (data.facilities) {
            updateData.facilities = JSON.stringify(data.facilities)
        }

        // Update academy
        const updatedAcademy = await prisma.academy.update({
            where: { id },
            data: updateData,
            include: {
                headCoach: {
                    select: {
                        id: true,
                        fullName: true,
                        photoUrl: true,
                        primarySpecialization: true
                    }
                },
                _count: {
                    select: {
                        students: true,
                        batches: true
                    }
                }
            }
        })

        console.log("✅ ACADEMY - Updated:", updatedAcademy.name)

        return NextResponse.json({
            success: true,
            data: {
                academy: updatedAcademy,
                message: 'Academy updated successfully'
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("❌ ACADEMY PATCH ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update academy' } },
            { status: 500 }
        )
    }
}

// DELETE - Remove academy
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const { id } = await params

        // Verify academy exists and check counts
        const academy = await prisma.academy.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        students: true,
                        batches: true
                    }
                }
            }
        })

        if (!academy) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Academy not found' } },
                { status: 404 }
            )
        }

        // Check for active students
        if (academy._count.students > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'ACADEMY_HAS_STUDENTS',
                        message: `Cannot delete academy with ${academy._count.students} student(s). Please transfer students first.`,
                        details: { activeStudents: academy._count.students }
                    }
                },
                { status: 400 }
            )
        }

        // Check for active batches
        const activeBatches = await prisma.batch.count({
            where: { academyId: id, status: 'ACTIVE' }
        })

        if (activeBatches > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'ACADEMY_HAS_BATCHES',
                        message: `Cannot delete academy with ${activeBatches} active batch(es). Please close batches first.`,
                        details: { activeBatches }
                    }
                },
                { status: 400 }
            )
        }

        // Require confirmation header
        const confirmToken = request.headers.get('x-confirm-delete')
        if (confirmToken !== id) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'CONFIRMATION_REQUIRED',
                        message: 'Deletion confirmation required',
                        details: { academyId: id, academyName: academy.name }
                    }
                },
                { status: 400 }
            )
        }

        console.log("🏫 ACADEMY - Deleting:", academy.name)

        // Delete academy
        await prisma.academy.delete({ where: { id } })

        console.log("✅ ACADEMY - Deleted:", academy.name)

        return NextResponse.json({
            success: true,
            data: { message: `Academy "${academy.name}" deleted successfully` },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("❌ ACADEMY DELETE ERROR:", error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete academy' } },
            { status: 500 }
        )
    }
}
