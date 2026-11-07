import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to prevent Next.js caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch all students with pending payment screenshots
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const students = await prisma.student.findMany({
            where: {
                registrationStatus: 'SCREENSHOT_UPLOADED',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({
            success: true,
            data: students,
            count: students.length,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('[Admin Pending Payments GET Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch pending payments' } },
            { status: 500 }
        )
    }
}
