import { prisma } from '@/lib/prisma'

interface LeaveRequestData {
    startDate: string
    endDate: string
    leaveType: string
    reason: string
    supportingDocument?: string
}

export async function handleLeaveApproval(
    request: { id: string; requesterId: string; requesterRole: string },
    leaveData: LeaveRequestData,
    adminId: string
) {
    // 1. Get student or coach based on requester role
    const user = await prisma.user.findUnique({
        where: { id: request.requesterId },
        include: {
            student: { select: { id: true, batchId: true, academyId: true, coachId: true } },
            coach: { select: { id: true } }
        }
    })

    if (!user) {
        throw new Error('Requester not found')
    }

    const studentId = user.student?.id
    const coachId = user.coach?.id

    // 2. Create Leave record
    const leave = await prisma.leave.create({
        data: {
            studentId: request.requesterRole === 'STUDENT' ? studentId : null,
            coachId: request.requesterRole === 'COACH' ? coachId : null,
            userRole: request.requesterRole,
            leaveType: leaveData.leaveType,
            startDate: new Date(leaveData.startDate),
            endDate: new Date(leaveData.endDate),
            reason: leaveData.reason,
            supportingDocument: leaveData.supportingDocument,
            status: 'APPROVED',
            approvedById: adminId,
            approvedAt: new Date(),
            requestId: request.id
        }
    })

    // 3. Mark attendance as LEAVE for the date range (for students only)
    let attendanceMarked = 0

    if (studentId && user.student?.batchId) {
        // Generate date range
        const dates: Date[] = []
        const currentDate = new Date(leaveData.startDate)
        const endDate = new Date(leaveData.endDate)

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // Create attendance records for leave days
        for (const date of dates) {
            try {
                await prisma.attendance.upsert({
                    where: {
                        studentId_date: {
                            studentId: studentId,
                            date: date
                        }
                    },
                    update: {
                        status: 'LEAVE',
                        remarks: `Leave approved: ${leaveData.leaveType}`
                    },
                    create: {
                        studentId: studentId,
                        batchId: user.student!.batchId,
                        coachId: user.student?.coachId,
                        date: date,
                        status: 'LEAVE',
                        remarks: `Leave approved: ${leaveData.leaveType}`
                    }
                })
                attendanceMarked++
            } catch (err) {
                // Skip if attendance already exists for that date
                console.warn(`Could not mark attendance for ${date}:`, err)
            }
        }
    }

    return {
        leaveId: leave.id,
        attendanceMarked,
        message: `Leave approved from ${leaveData.startDate} to ${leaveData.endDate}`
    }
}
