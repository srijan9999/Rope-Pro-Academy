import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const where: any = {}
        if (status) {
            where.user = {
                status: status
            }
        }

        const students = await prisma.student.findMany({
            where,
            select: {
                id: true,
                studentId: true,
                fullName: true,
                photoUrl: true,
                user: {
                    select: {
                        status: true
                    }
                }
            },
            orderBy: {
                studentId: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            data: students
        })

    } catch (error) {
        console.error('[GET Students Error]:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch students' } },
            { status: 500 }
        )
    }
}
