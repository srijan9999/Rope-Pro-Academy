import { prisma } from '@/lib/prisma'

interface ProfileUpdateData {
    fieldName: string
    currentValue: any
    requestedValue: any
    reason: string
}

// Fields that can be updated via request system
const STUDENT_ALLOWED_FIELDS = [
    'dateOfBirth',
    'bloodGroup',
    'emergencyContact',
    'emergencyPhone',
    'parentName',
    'parentPhone',
    'parentEmail',
    'schoolName',
    'grade',
    'phone',
    'whatsapp'
]

const COACH_ALLOWED_FIELDS = [
    'phone',
    'address',
    'qualifications',
    'certifications'
]

export async function handleProfileUpdateApproval(
    request: { id: string; requesterId: string; requesterRole: string },
    updateData: ProfileUpdateData,
    adminId: string
) {
    const { fieldName, requestedValue, currentValue } = updateData

    // Get user with profile
    const user = await prisma.user.findUnique({
        where: { id: request.requesterId },
        include: {
            student: true,
            coach: true
        }
    })

    if (!user) {
        throw new Error('User not found')
    }

    if (request.requesterRole === 'STUDENT') {
        if (!user.student) {
            throw new Error('Student profile not found')
        }

        if (!STUDENT_ALLOWED_FIELDS.includes(fieldName)) {
            throw new Error(`Field '${fieldName}' cannot be updated through requests`)
        }

        // Update the field
        await prisma.student.update({
            where: { id: user.student.id },
            data: {
                [fieldName]: requestedValue
            }
        })

        // Log the change
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: 'APPROVE_PROFILE_UPDATE',
                entityType: 'STUDENT',
                entityId: user.student.id,
                oldValue: JSON.stringify({ [fieldName]: currentValue }),
                newValue: JSON.stringify({ [fieldName]: requestedValue }),
                ipAddress: 'system',
                userAgent: 'profile-update-handler'
            }
        })

        return {
            updated: true,
            table: 'Student',
            field: fieldName,
            oldValue: currentValue,
            newValue: requestedValue,
            message: `${fieldName} updated successfully`
        }

    } else if (request.requesterRole === 'COACH') {
        if (!user.coach) {
            throw new Error('Coach profile not found')
        }

        if (!COACH_ALLOWED_FIELDS.includes(fieldName)) {
            throw new Error(`Field '${fieldName}' cannot be updated through requests`)
        }

        await prisma.coach.update({
            where: { id: user.coach.id },
            data: {
                [fieldName]: requestedValue
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: 'APPROVE_PROFILE_UPDATE',
                entityType: 'COACH',
                entityId: user.coach.id,
                oldValue: JSON.stringify({ [fieldName]: currentValue }),
                newValue: JSON.stringify({ [fieldName]: requestedValue }),
                ipAddress: 'system',
                userAgent: 'profile-update-handler'
            }
        })

        return {
            updated: true,
            table: 'Coach',
            field: fieldName,
            oldValue: currentValue,
            newValue: requestedValue,
            message: `${fieldName} updated successfully`
        }
    }

    throw new Error('Unsupported requester role for profile updates')
}
