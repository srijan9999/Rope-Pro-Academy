/** Role string union — Prisma stores as String, TS enforces at compile time */
export type Role = "ADMIN" | "COACH" | "STUDENT"

/** User account status union */
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "PENDING_PAYMENT"

/** Type guard for Role */
export function isRole(value: string): value is Role {
    return ["ADMIN", "COACH", "STUDENT"].includes(value)
}

/** Dashboard path by role */
export const DASHBOARD_PATHS: Record<Role, string> = {
    ADMIN: "/dashboard/admin",
    COACH: "/dashboard/coach",
    STUDENT: "/dashboard/player",
} as const
