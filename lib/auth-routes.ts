export const UPDATE_PASSWORD_PATH = "/update-password"

// Real dashboard routes for Rope Pro Academy
const ROLE_HOME: Record<string, string> = {
    ADMIN: "/dashboard/admin",
    COACH: "/dashboard/coach",
    PLAYER: "/dashboard/player",
    STUDENT: "/dashboard/player",
}

export function getRoleHome(role?: string | null): string {
    return (role && ROLE_HOME[role.toUpperCase()]) || "/"
}
