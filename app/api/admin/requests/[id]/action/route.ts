import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'

// PATCH - Approve/Reject request
export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }  // Next.js 15: params is a Promise
) {

    try {
        // CRITICAL: In Next.js 15+, params is a Promise and must be awaited
        const { id: requestId } = await context.params

        // 1. Check Authentication
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        // 2. Parse request body
        const body = await request.json()

        const { action, adminNote } = body

        if (!action || !['APPROVE', 'REJECT', 'UNDER_REVIEW', 'CANCEL'].includes(action)) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action' } },
                { status: 400 }
            )
        }

        // 3. Check if request exists
        const existingRequest = await prisma.request.findUnique({
            where: { id: requestId }
        })

        if (existingRequest) {
        }

        if (!existingRequest) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } },
                { status: 404 }
            )
        }

        // 4. Calculate new status
        const newStatus = action === 'APPROVE' ? 'APPROVED'
            : action === 'REJECT' ? 'REJECTED'
                : action === 'CANCEL' ? 'CANCELLED'
                    : 'UNDER_REVIEW'


        // 5. Update using Prisma ORM - use 'as any' to bypass TypeScript cache issues
        const updateData: any = {
            status: newStatus,
            updatedAt: new Date()
        }


        const updatedRequest = await (prisma.request as any).update({
            where: { id: requestId },
            data: updateData
        })


        return NextResponse.json({
            success: true,
            data: {
                request: updatedRequest,
                message: `Request ${newStatus.toLowerCase()} successfully`
            }
        })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
            { status: 500 }
        )
    }
}
