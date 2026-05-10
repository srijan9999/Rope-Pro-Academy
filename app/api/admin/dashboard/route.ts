import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import type { DashboardStatsResponse, RecentRegistration, UserProfile } from "@/types/api"

export async function GET() {
    try {
        // 1. Session validation
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                    timestamp: new Date().toISOString()
                },
                { status: 401 }
            )
        }

        // 2. Role authorization
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Admin access required' },
                    timestamp: new Date().toISOString()
                },
                { status: 403 }
            )
        }

        // 3. Status check
        if (session.user.status !== 'ACTIVE') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'ACCOUNT_INACTIVE', message: 'Your account is not active' },
                    timestamp: new Date().toISOString()
                },
                { status: 403 }
            )
        }

        console.log("📊 ADMIN DASHBOARD - Fetching stats for:", session.user.email)

        // 4. Execute parallel database queries for performance
        const [
            activeStudents,
            coachesActive,
            coachesPending,
            coachesInactive,
            pendingRegistrations,
            recentUsers
        ] = await Promise.all([
            // Active students count
            prisma.user.count({
                where: { role: 'STUDENT', status: 'ACTIVE' }
            }),
            // Coach breakdown by status
            prisma.user.count({
                where: { role: 'COACH', status: 'ACTIVE' }
            }),
            prisma.user.count({
                where: { role: 'COACH', status: 'PENDING' }
            }),
            prisma.user.count({
                where: { role: 'COACH', status: 'INACTIVE' }
            }),
            // Pending registrations (users awaiting approval)
            prisma.user.count({
                where: { status: 'PENDING' }
            }),
            // Recent 5 registrations with profile data
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    student: {
                        select: {
                            fullName: true,
                            photoUrl: true,
                            studentId: true,
                            phone: true,
                            academy: {
                                select: { id: true, name: true }
                            },
                            batch: {
                                select: { id: true, name: true }
                            },
                            skillLevel: true,
                            totalMedals: true
                        }
                    },
                    coach: {
                        select: {
                            fullName: true,
                            photoUrl: true,
                            coachId: true,
                            phone: true,
                            primarySpecialization: true
                        }
                    },
                    admin: {
                        select: {
                            fullName: true,
                            photoUrl: true,
                            phone: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ])

        // 5. Transform recent registrations to response format
        const recentRegistrations: RecentRegistration[] = recentUsers.map(user => {
            // Build profile based on role
            let profile: UserProfile = { fullName: 'Unknown' }

            if (user.student) {
                profile = {
                    fullName: user.student.fullName,
                    photoUrl: user.student.photoUrl,
                    phone: user.student.phone,
                    studentId: user.student.studentId,
                    academy: user.student.academy,
                    batch: user.student.batch,
                    skillLevel: user.student.skillLevel,
                    totalMedals: user.student.totalMedals
                }
            } else if (user.coach) {
                profile = {
                    fullName: user.coach.fullName,
                    photoUrl: user.coach.photoUrl,
                    phone: user.coach.phone,
                    coachId: user.coach.coachId,
                    specialization: user.coach.primarySpecialization
                }
            } else if (user.admin) {
                profile = {
                    fullName: user.admin.fullName,
                    photoUrl: user.admin.photoUrl,
                    phone: user.admin.phone
                }
            }

            return {
                id: user.id,
                email: user.email,
                role: user.role as 'STUDENT' | 'COACH' | 'ADMIN',
                status: user.status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
                createdAt: user.createdAt.toISOString(),
                profile
            }
        })

        // 6. Build success response
        const response: DashboardStatsResponse = {
            success: true,
            data: {
                stats: {
                    activeStudents,
                    totalCoaches: {
                        total: coachesActive + coachesPending + coachesInactive,
                        active: coachesActive,
                        pending: coachesPending,
                        inactive: coachesInactive
                    },
                    pendingRequests: {
                        registrations: pendingRegistrations,
                        requests: 0, // TODO: Add Request table query when implemented
                        total: pendingRegistrations
                    }
                },
                recentRegistrations
            },
            timestamp: new Date().toISOString()
        }

        console.log("✅ ADMIN DASHBOARD - Stats fetched successfully")

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error("❌ ADMIN DASHBOARD ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                },
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}
