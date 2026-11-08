import { getServerSession, Session } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { Role } from "@/lib/roles"

export interface GuardSuccess {
    session: Session & {
        user: {
            id: string
            email: string
            role: Role
            status: string
            mustChangePassword?: boolean
        }
    }
    response?: never
}

export interface GuardFailure {
    session?: never
    response: NextResponse
}

export type GuardResult = GuardSuccess | GuardFailure

/**
 * Enforces authentication, mustChangePassword restriction, and allowed roles.
 * Returns either { session } on success or { response } on failure.
 */
export async function requireRole(...allowedRoles: Role[]): Promise<GuardResult> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.role) {
        return {
            response: NextResponse.json(
                { success: false, error: "Unauthorized - Please login" },
                { status: 401 }
            ),
        }
    }

    // Force password change guard
    if (session.user.mustChangePassword) {
        return {
            response: NextResponse.json(
                {
                    success: false,
                    error: "Password change required. Please update your password to continue.",
                    code: "PASSWORD_CHANGE_REQUIRED",
                },
                { status: 403 }
            ),
        }
    }

    // Active status guard
    if (session.user.status !== "ACTIVE") {
        return {
            response: NextResponse.json(
                {
                    success: false,
                    error: "Account is not active.",
                    code: "ACCOUNT_NOT_ACTIVE",
                },
                { status: 403 }
            ),
        }
    }

    // Role check
    const userRole = session.user.role as Role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return {
            response: NextResponse.json(
                { success: false, error: "Forbidden - Insufficient permissions" },
                { status: 403 }
            ),
        }
    }

    return {
        session: session as GuardSuccess["session"],
    }
}
