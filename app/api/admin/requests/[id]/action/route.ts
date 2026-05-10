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
    console.log('\n\n========================================')
    console.log('[PATCH] Request Action API Called')

    try {
        // CRITICAL: In Next.js 15+, params is a Promise and must be awaited
        const { id: requestId } = await context.params
        console.log('[PATCH] Request ID:', requestId)
        console.log('========================================\n')

        // 1. Check Authentication
        const session = await getServerSession(authOptions)
        console.log('[PATCH] Session:', session?.user?.email, session?.user?.role)

        if (!session?.user) {
            console.log('[PATCH] ERROR: No session')
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 }
            )
        }

        if (session.user.role !== 'ADMIN') {
            console.log('[PATCH] ERROR: Not admin, role is:', session.user.role)
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            )
        }

        // 2. Parse request body
        const body = await request.json()
        console.log('[PATCH] Body:', JSON.stringify(body))

        const { action, adminNote } = body

        if (!action || !['APPROVE', 'REJECT', 'UNDER_REVIEW', 'CANCEL'].includes(action)) {
            console.log('[PATCH] ERROR: Invalid action:', action)
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action' } },
                { status: 400 }
            )
        }

        // 3. Check if request exists
        const existingRequest = await prisma.request.findUnique({
            where: { id: requestId }
        })

        console.log('[PATCH] Existing request found:', existingRequest ? 'YES' : 'NO')
        if (existingRequest) {
            console.log('[PATCH] Current status:', existingRequest.status)
        }

        if (!existingRequest) {
            console.log('[PATCH] ERROR: Request not found with ID:', requestId)
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

        console.log('[PATCH] Changing status from', existingRequest.status, 'to', newStatus)

        // 5. Update using Prisma ORM - use 'as any' to bypass TypeScript cache issues
        const updateData: any = {
            status: newStatus,
            updatedAt: new Date()
        }

        console.log('[PATCH] Update data:', JSON.stringify(updateData))

        const updatedRequest = await (prisma.request as any).update({
            where: { id: requestId },
            data: updateData
        })

        console.log('[PATCH] ✅ SUCCESS! Updated request:', updatedRequest.id)
        console.log('[PATCH] ✅ New status in DB:', updatedRequest.status)
        console.log('========================================\n')

        return NextResponse.json({
            success: true,
            data: {
                request: updatedRequest,
                message: `Request ${newStatus.toLowerCase()} successfully`
            }
        })

    } catch (error: any) {
        console.log('[PATCH] ❌ ERROR:', error.message)
        console.log('[PATCH] ❌ Stack:', error.stack)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
            { status: 500 }
        )
    }
}
