import { prisma } from '@/lib/prisma'

interface TransferRequestData {
    transferType: 'ACADEMY' | 'BATCH'
    currentAcademyId?: string
    requestedAcademyId?: string
    currentBatchId?: string
    requestedBatchId?: string
    reason: string
    effectiveDate: string
}

export async function handleTransferApproval(
    request: { id: string; requesterId: string; requesterRole: string },
    transferData: TransferRequestData,
    adminId: string
) {
    // Only students can request transfers
    if (request.requesterRole !== 'STUDENT') {
        throw new Error('Only students can request transfers')
    }

    // Get student
    const user = await prisma.user.findUnique({
        where: { id: request.requesterId },
        include: {
            student: {
                select: {
                    id: true,
                    fullName: true,
                    academyId: true,
                    batchId: true
                }
            }
        }
    })

    if (!user?.student) {
        throw new Error('Student not found')
    }

    const student = user.student

    if (transferData.transferType === 'ACADEMY') {
        if (!transferData.requestedAcademyId) {
            throw new Error('Target academy ID is required')
        }

        // Validate target academy exists and has capacity
        const targetAcademy = await prisma.academy.findUnique({
            where: { id: transferData.requestedAcademyId },
            include: {
                _count: { select: { students: true } }
            }
        })

        if (!targetAcademy) {
            throw new Error('Target academy not found')
        }

        if (targetAcademy._count.students >= targetAcademy.capacity) {
            throw new Error(`Target academy is at full capacity (${targetAcademy.capacity} students)`)
        }

        // Update student's academy
        await prisma.student.update({
            where: { id: student.id },
            data: {
                academyId: transferData.requestedAcademyId,
                // Clear batch when transferring academies (they'll need to be assigned to a new batch)
                batchId: null
            }
        })

        // Log the transfer
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: 'APPROVE_ACADEMY_TRANSFER',
                entityType: 'STUDENT',
                entityId: student.id,
                oldValue: JSON.stringify({ academyId: student.academyId }),
                newValue: JSON.stringify({ academyId: transferData.requestedAcademyId }),
                ipAddress: 'system',
                userAgent: 'transfer-handler'
            }
        })

        return {
            transferred: true,
            type: 'ACADEMY',
            from: student.academyId,
            to: transferData.requestedAcademyId,
            academyName: targetAcademy.name,
            message: `${student.fullName} transferred to ${targetAcademy.name}`
        }

    } else if (transferData.transferType === 'BATCH') {
        if (!transferData.requestedBatchId) {
            throw new Error('Target batch ID is required')
        }

        // Validate target batch exists and has capacity
        const targetBatch = await prisma.batch.findUnique({
            where: { id: transferData.requestedBatchId },
            include: {
                _count: { select: { students: true } }
            }
        })

        if (!targetBatch) {
            throw new Error('Target batch not found')
        }

        if (targetBatch._count.students >= targetBatch.maxCapacity) {
            throw new Error(`Target batch is full (${targetBatch.maxCapacity} students max)`)
        }

        // Update batch enrollment counts
        if (student.batchId) {
            await prisma.batch.update({
                where: { id: student.batchId },
                data: {
                    currentStrength: { decrement: 1 }
                }
            })
        }

        await prisma.batch.update({
            where: { id: transferData.requestedBatchId },
            data: {
                currentStrength: { increment: 1 }
            }
        })

        // Update student's batch
        await prisma.student.update({
            where: { id: student.id },
            data: {
                batchId: transferData.requestedBatchId
            }
        })

        // Log the transfer
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: 'APPROVE_BATCH_TRANSFER',
                entityType: 'STUDENT',
                entityId: student.id,
                oldValue: JSON.stringify({ batchId: student.batchId }),
                newValue: JSON.stringify({ batchId: transferData.requestedBatchId }),
                ipAddress: 'system',
                userAgent: 'transfer-handler'
            }
        })

        return {
            transferred: true,
            type: 'BATCH',
            from: student.batchId,
            to: transferData.requestedBatchId,
            batchName: targetBatch.name,
            message: `${student.fullName} transferred to ${targetBatch.name}`
        }
    }

    throw new Error('Invalid transfer type')
}
