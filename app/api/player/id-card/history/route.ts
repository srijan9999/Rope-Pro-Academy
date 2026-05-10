import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
                { status: 403 }
            )
        }

        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } },
                { status: 404 }
            )
        }

        const history = await prisma.iDCardHistory.findMany({
            where: { studentId: student.id },
            orderBy: { issuedAt: 'desc' },
            take: 20,
        })

        return NextResponse.json({
            success: true,
            data: history.map(h => ({
                id: h.id,
                version: h.version,
                card_serial_number: h.cardSerialNumber,
                changes: h.changes ? JSON.parse(h.changes) : null,
                change_reason: h.changeReason,
                issued_at: h.issuedAt.toISOString(),
                valid_until: h.validUntil?.toISOString() || null,
                is_current: h.isCurrent,
                is_revoked: h.isRevoked,
                revoked_reason: h.revokedReason,
            })),
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Get ID Card History Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch card history' } },
            { status: 500 }
        )
    }
}
