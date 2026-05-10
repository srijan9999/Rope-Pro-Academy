import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    generateCardSerialNumber,
    generateQRPayload,
    generateBarcodeValue,
    generateNFCSignature,
    generateBlockchainHash,
    generateDigitalSignature,
    calculateCardExpiry,
} from '@/lib/id-card'

export async function GET() {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        // 2. Fetch student with all relations
        let student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: { email: true, status: true }
                },
                batch: {
                    select: {
                        id: true,
                        name: true,
                        startTime: true,
                        endTime: true,
                        skillLevel: true,
                    }
                },
                academy: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        address: true,
                    }
                },
                coach: {
                    select: {
                        fullName: true,
                        photoUrl: true,
                    }
                }
            }
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
                { status: 404 }
            )
        }

        // 3. Auto-generate security features if they don't exist
        const updateData: Record<string, unknown> = {}

        if (!student.cardSerialNumber) {
            updateData.cardSerialNumber = await generateCardSerialNumber()
        }

        const serialNumber = (updateData.cardSerialNumber as string) || student.cardSerialNumber || ''

        if (!student.cardExpiryDate) {
            updateData.cardExpiryDate = calculateCardExpiry(student.cardIssuedDate)
        }

        if (!student.qrCode && serialNumber) {
            updateData.qrCode = generateQRPayload({
                studentId: student.studentId,
                serialNumber,
                fullName: student.fullName,
                expiry: (updateData.cardExpiryDate as Date || student.cardExpiryDate)?.toISOString(),
            })
        }

        if (!student.barcode && serialNumber) {
            updateData.barcode = generateBarcodeValue(serialNumber)
        }

        if (!student.nfcSignature && serialNumber) {
            updateData.nfcSignature = generateNFCSignature(student.id, serialNumber)
        }

        if (!student.blockchainHash && serialNumber) {
            updateData.blockchainHash = generateBlockchainHash({
                studentId: student.studentId,
                serialNumber,
                issuedDate: student.cardIssuedDate.toISOString(),
            })
        }

        if (!student.digitalSignature && serialNumber) {
            updateData.digitalSignature = generateDigitalSignature(student.id, serialNumber)
        }

        // Save generated security features
        if (Object.keys(updateData).length > 0) {
            student = await prisma.student.update({
                where: { id: student.id },
                data: updateData,
                include: {
                    user: { select: { email: true, status: true } },
                    batch: { select: { id: true, name: true, startTime: true, endTime: true, skillLevel: true } },
                    academy: { select: { id: true, name: true, location: true, address: true } },
                    coach: { select: { fullName: true, photoUrl: true } },
                }
            })
        }

        // 4. Increment view count (fire and forget)
        prisma.student.update({
            where: { id: student.id },
            data: { cardViews: { increment: 1 } }
        }).catch(() => { })

        // 5. Calculate age
        let age: number | null = null
        if (student.dateOfBirth) {
            const today = new Date()
            const birth = new Date(student.dateOfBirth)
            age = today.getFullYear() - birth.getFullYear()
            const m = today.getMonth() - birth.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--
            }
        }

        // 6. Return comprehensive data
        return NextResponse.json({
            success: true,
            data: {
                // Personal
                student_id: student.studentId,
                full_name: student.fullName,
                photo_url: student.photoUrl,
                date_of_birth: student.dateOfBirth?.toISOString() || null,
                age,
                blood_group: student.bloodGroup,
                gender: student.gender,

                // Contact
                phone: student.phone,
                email: student.user.email,
                whatsapp: student.whatsapp,
                emergency_contact: student.emergencyContact,
                emergency_phone: student.emergencyPhone,

                // Parent/Guardian
                parent_name: student.parentName,
                parent_phone: student.parentPhone,

                // Medical
                medical_conditions: student.medicalConditions,

                // Academic
                batch: student.batch ? {
                    id: student.batch.id,
                    name: student.batch.name,
                    time_slot: student.batch.startTime && student.batch.endTime
                        ? `${student.batch.startTime} - ${student.batch.endTime}`
                        : null,
                    skill_level: student.batch.skillLevel,
                } : null,
                academy: student.academy ? {
                    id: student.academy.id,
                    name: student.academy.name,
                    location: student.academy.location,
                    address: student.academy.address,
                } : null,
                coach: student.coach ? {
                    name: student.coach.fullName,
                    photo: student.coach.photoUrl,
                } : null,

                // Membership
                membership_tier: student.membershipTier,
                member_since: student.joiningDate.toISOString(),
                valid_until: student.cardExpiryDate?.toISOString() || null,
                skill_level: student.skillLevel,

                // Status
                is_active: student.user.status === 'ACTIVE',
                fee_status: student.feeStatus,
                attendance_rate: student.attendancePercentage,
                gate_access: student.gateAccess,

                // Security
                card_serial_number: student.cardSerialNumber,
                qr_code: student.qrCode,
                barcode: student.barcode,
                nfc_signature: student.nfcSignature,
                blockchain_hash: student.blockchainHash,
                digital_signature: student.digitalSignature,

                // Achievements
                total_medals: student.totalMedals,
                guinness_records: student.guinnessRecords,
                national_medals: student.nationalMedals,
                state_medals: student.stateMedals,

                // Analytics
                card_version: student.cardVersion,
                card_issued_date: student.cardIssuedDate.toISOString(),
                last_updated: student.lastCardUpdate.toISOString(),
                card_views: student.cardViews,
                card_downloads: student.cardDownloads,
                card_shares: student.cardShares,
                total_scans: student.qrScans,

                // Access
                access_level: student.accessLevel,
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Get ID Card Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ID card data' } },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        const body = await request.json()

        // 2. Find student
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
                { status: 404 }
            )
        }

        // 3. Build update object from allowed fields
        const allowedUpdates: Record<string, unknown> = {}
        const changes: Record<string, { old: unknown; new: unknown }> = {}

        if (body.photo_url !== undefined) {
            changes.photoUrl = { old: student.photoUrl, new: body.photo_url }
            allowedUpdates.photoUrl = body.photo_url
        }
        if (body.blood_group !== undefined) {
            changes.bloodGroup = { old: student.bloodGroup, new: body.blood_group }
            allowedUpdates.bloodGroup = body.blood_group
        }
        if (body.date_of_birth !== undefined) {
            changes.dateOfBirth = { old: student.dateOfBirth, new: body.date_of_birth }
            allowedUpdates.dateOfBirth = new Date(body.date_of_birth)
        }
        if (body.emergency_contact !== undefined) {
            changes.emergencyContact = { old: student.emergencyContact, new: body.emergency_contact }
            allowedUpdates.emergencyContact = body.emergency_contact
        }
        if (body.emergency_phone !== undefined) {
            changes.emergencyPhone = { old: student.emergencyPhone, new: body.emergency_phone }
            allowedUpdates.emergencyPhone = body.emergency_phone
        }
        if (body.medical_conditions !== undefined) {
            changes.medicalConditions = { old: student.medicalConditions, new: body.medical_conditions }
            allowedUpdates.medicalConditions = body.medical_conditions
        }
        if (body.phone !== undefined) {
            changes.phone = { old: student.phone, new: body.phone }
            allowedUpdates.phone = body.phone
        }
        if (body.whatsapp !== undefined) {
            changes.whatsapp = { old: student.whatsapp, new: body.whatsapp }
            allowedUpdates.whatsapp = body.whatsapp
        }

        if (Object.keys(allowedUpdates).length === 0) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'No valid fields to update' } },
                { status: 400 }
            )
        }

        // 4. Bump version and update
        const newVersion = student.cardVersion + 1

        const updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
                ...allowedUpdates,
                cardVersion: newVersion,
                lastCardUpdate: new Date(),
            }
        })

        // 5. Create history record
        await prisma.iDCardHistory.create({
            data: {
                studentId: student.id,
                version: student.cardVersion, // Previous version
                cardSerialNumber: student.cardSerialNumber || '',
                changes: JSON.stringify(changes),
                changeReason: body.change_reason || 'Details updated by student',
                cardData: JSON.stringify({
                    fullName: student.fullName,
                    photoUrl: student.photoUrl,
                    bloodGroup: student.bloodGroup,
                    emergencyContact: student.emergencyContact,
                    dateOfBirth: student.dateOfBirth,
                }),
                isCurrent: false,
                validUntil: student.cardExpiryDate,
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                card_version: newVersion,
                last_updated: updatedStudent.lastCardUpdate.toISOString(),
                changes_applied: Object.keys(changes),
            },
            message: 'ID card updated successfully',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Update ID Card Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update ID card' } },
            { status: 500 }
        )
    }
}
