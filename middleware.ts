import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { DASHBOARD_PATHS, isRole } from "@/lib/roles"
import { UPDATE_PASSWORD_PATH, getRoleHome } from "@/lib/auth-routes"

function matchesPath(pathname: string, base: string): boolean {
    return pathname === base || pathname.startsWith(base + "/")
}

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    const { pathname } = request.nextUrl
    const mustChange = token?.mustChangePassword === true
    const isAuthRoute = matchesPath(pathname, "/login") || matchesPath(pathname, "/register")
    const isDashboardRoute = matchesPath(pathname, "/dashboard")

    // 1. Unauthenticated users trying to access protected routes
    if (!token) {
        if (isDashboardRoute || pathname === UPDATE_PASSWORD_PATH) {
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(loginUrl)
        }
        return NextResponse.next()
    }

    // 2. Validate token role (fail closed to /login if unknown)
    const role = token.role as string
    if (!role || !isRole(role)) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // 3. Flagged users (mustChangePassword === true)
    if (mustChange) {
        // Intercept only dashboard and auth pages; public pages stay accessible
        if (pathname !== UPDATE_PASSWORD_PATH && (isDashboardRoute || isAuthRoute)) {
            return NextResponse.redirect(new URL(UPDATE_PASSWORD_PATH, request.url))
        }
        return NextResponse.next()
    }

    // 4. Unflagged users should not access /update-password
    if (pathname === UPDATE_PASSWORD_PATH) {
        return NextResponse.redirect(new URL(getRoleHome(role), request.url))
    }

    // 5. Signed-in users visiting /login or /register -> redirect to role home
    if (isAuthRoute) {
        return NextResponse.redirect(new URL(getRoleHome(role), request.url))
    }

    // 6. Role-based dashboard access control with exact-or-slash boundaries
    if (isDashboardRoute) {
        // Admin preview of ID cards in coach and player portals
        const isIdCardPreview =
            matchesPath(pathname, "/dashboard/coach/id-card") ||
            matchesPath(pathname, "/dashboard/player/id-card")

        if (matchesPath(pathname, "/dashboard/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL(getRoleHome(role), request.url))
        }

        if (matchesPath(pathname, "/dashboard/coach") && role !== "COACH" && !(role === "ADMIN" && isIdCardPreview)) {
            return NextResponse.redirect(new URL(getRoleHome(role), request.url))
        }

        if (matchesPath(pathname, "/dashboard/player") && role !== "STUDENT" && !(role === "ADMIN" && isIdCardPreview)) {
            return NextResponse.redirect(new URL(getRoleHome(role), request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
}
