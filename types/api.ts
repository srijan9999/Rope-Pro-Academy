// API Response Types for Admin Dashboard

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'STUDENT' | 'COACH' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE'

export interface UserProfile {
    fullName: string
    photoUrl?: string | null
    phone?: string | null
    studentId?: string
    coachId?: string
    academy?: {
        id: string
        name: string
    } | null
    batch?: {
        id: string
        name: string
    } | null
    skillLevel?: string
    specialization?: string
    totalMedals?: number
}

// ============================================
// DASHBOARD API TYPES
// ============================================

export interface CoachStats {
    total: number
    active: number
    pending: number
    inactive: number
}

export interface PendingRequestStats {
    registrations: number
    requests: number
    total: number
}

export interface DashboardStats {
    activeStudents: number
    totalCoaches: CoachStats
    pendingRequests: PendingRequestStats
}

export interface RecentRegistration {
    id: string
    email: string
    role: UserRole
    status: UserStatus
    createdAt: string
    profile: UserProfile
}

export interface DashboardStatsResponse {
    success: true
    data: {
        stats: DashboardStats
        recentRegistrations: RecentRegistration[]
    }
    timestamp: string
}

// ============================================
// USER DIRECTORY API TYPES
// ============================================

export interface PaginatedUser {
    id: string
    email: string
    role: UserRole
    status: UserStatus
    createdAt: string
    lastLogin?: string | null
    profile: UserProfile
}

export interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalUsers: number
    usersPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export interface UserFilters {
    query?: string
    role?: UserRole
    status?: UserStatus
    academy?: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
}

export interface UserDirectoryResponse {
    success: true
    data: {
        users: PaginatedUser[]
        pagination: PaginationInfo
        filters: UserFilters
    }
    timestamp: string
}

// ============================================
// ERROR RESPONSE TYPE
// ============================================


export interface ApiErrorResponse {
    success: false
    error: {
        code: string
        message: string
        details?: unknown
    }
    timestamp: string
}

export type ApiResponse<T> = T | ApiErrorResponse

// ============================================
// PLAYER DASHBOARD TYPES
// ============================================

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPETITIVE'

export interface DashboardAttendance {
    thisMonth: {
        present: number
        absent: number
        leave: number
        total: number
        percentage: number
    }
    lastMonth: {
        present: number
        total: number
        percentage: number
    }
    trend: {
        change: number
        improving: boolean
    }
    streaks: {
        current: number
        longest: number
    }
}

export interface DashboardClass {
    id: string
    date: string
    day: string
    time: string
    title: string
    type: string
    academy: {
        id: string
        name: string
        location: string
    }
    coach: {
        id: string
        full_name: string
    }
    status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'
}

export interface SkillProgress {
    currentLevel: SkillLevel
    progressToNext: number
    nextLevel: SkillLevel | null
    nextAssessment: {
        date: string
        daysUntil: number
    } | null
    metrics: {
        speed: { current: number; target: number; percentage: number }
        endurance: { current: number; target: number; percentage: number }
        freestyle: { current: number; target: number; percentage: number }
        doubleUnders: { current: number; target: number; percentage: number }
    }
}

export interface PlayerDashboardResponse {
    success: true
    data: {
        student: {
            id: string
            student_id: string
            full_name: string
            photo_url?: string | null
            skill_level: SkillLevel
            joining_date: string
            total_medals: number
            academy: {
                id: string
                name: string
                location: string
            }
            batch: {
                id: string
                name: string
                time_slot_start: string | null
                time_slot_end: string | null
                days_of_week: string[]
            }
            coach: {
                id: string
                full_name: string
                photo_url?: string | null
                specialization: string
            } | null
        }
        attendance: DashboardAttendance
        nextClass: DashboardClass | null
        upcomingClasses: Array<{
            id: string
            date: string
            time: string
            title: string
            type: string
        }>
        skillProgress: SkillProgress
        recentAchievements: Array<{
            id: string
            title: string
            description: string
            date: string
            type: string | null
            icon?: string
        }>
        coachFeedback: {
            latest: {
                id: string
                coach: {
                    id: string
                    full_name: string
                    photo_url?: string | null
                }
                message: string
                date: string
                sentiment: 'POSITIVE' | 'NEUTRAL' | 'CONSTRUCTIVE'
            } | null
            count: number
        }
    }
    timestamp: string
}

// ============================================
// SCHEDULE API TYPES
// ============================================

export interface ScheduleEvent {
    id: string
    title: string
    date: string // ISO date
    startTime: string // "HH:mm"
    endTime: string // "HH:mm"
    type: 'REGULAR' | 'SPECIAL' | 'ASSESSMENT'
    status: 'UPCOMING' | 'COMPLETED' | 'MISSED' | 'CANCELLED'
    coach?: {
        id: string
        fullName: string
    }
    location?: string
}

export interface PlayerScheduleResponse {
    success: true
    data: ScheduleEvent[]
    timestamp: string
}

// ============================================
// PROGRESS & EVALUATION TYPES (PHASE 8)
// ============================================

export type AssessmentType = 'REGULAR' | 'LEVEL_ADVANCEMENT' | 'COMPETITION_PREP' | 'INJURY_RECOVERY' | 'TRIAL' | 'FINAL'
export type Grade = 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C_PLUS' | 'C' | 'D' | 'F'
export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING'

export interface ProgressReport {
    id: string
    date: string
    assessmentType: string

    currentLevel: SkillLevel // Already exported
    recommendedLevel?: string | null

    metrics: {
        speed: number
        endurance: number
        freestyle: number
        doubleUnders: number
        crossovers?: number | null
        power?: number | null
        coordination?: number | null
        rhythm?: number | null
    }

    proficiency: {
        speed: number
        endurance: number
        freestyle: number
        doubleUnders: number
        technique: number
        overall: number
    }

    grade: string
    feedback: string
    strengths: string[]
    improvements: string[]
    goals: string[]

    coach: {
        id: string
        full_name: string
        photo_url?: string | null
        specialization?: string
    }

    batchAverage?: number | null
    improvement?: number | null

    videoUrl?: string | null
    attachments?: string[]
}

export interface ProgressResponse {
    success: true
    data: {
        currentReport: ProgressReport | null
        history: Array<{
            id: string
            date: string
            assessmentType: string
            overallScore: number
            grade: string
            coach: {
                id: string
                full_name: string
                photo_url?: string | null
            }
            feedback: string
            improvement?: number | null
        }>
        trends: {
            period: string
            overall: {
                improvement: number
                consistency: number
                direction: TrendDirection
            }
            bySkill: {
                speed: { trend: TrendDirection; change: number }
                endurance: { trend: TrendDirection; change: number }
                freestyle: { trend: TrendDirection; change: number }
                doubleUnders: { trend: TrendDirection; change: number }
            }
        } | null
        milestones: {
            achieved: Array<{
                id: string
                title: string
                achievedDate: string
                badge?: string | null
                points: number
            }>
            upcoming: Array<{
                id: string
                title: string
                progress: number
                targetValue: number
                currentValue: number
            }>
        }
        stats: {
            totalReports: number
            averageScore: number
            highestScore: number
            lowestScore: number
            recentImprovement: number
        }
    }
    timestamp: string
}

