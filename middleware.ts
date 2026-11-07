import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { DASHBOARD_PATHS, isRole } from "@/lib/roles"
import { UPDATE_PASSWORD_PATH, getRoleHome } from "@/lib/auth-routes"

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    const { pathname } = request.nextUrl
    const mustChange = token?.mustChangePassword === true

    // 1. Force password change interception
    if (token) {
        // Flagged users can ONLY see /update-password
        if (mustChange && pathname !== UPDATE_PASSWORD_PATH) {
            return NextResponse.redirect(new URL(UPDATE_PASSWORD_PATH, request.url))
        }

        // Unflagged users have no business on the forced-change page
        if (!mustChange && pathname === UPDATE_PASSWORD_PATH) {
            return NextResponse.redirect(new URL(getRoleHome(token?.role as string), request.url))
        }
    } else {
        // Unauthenticated access to /update-password redirects to login
        if (pathname === UPDATE_PASSWORD_PATH) {
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Check if user is trying to access the home page while logged in
    if (pathname === "/" && token) {
        if (mustChange) {
            return NextResponse.redirect(new URL(UPDATE_PASSWORD_PATH, request.url))
        }
        const role = token.role as string
        let dashboardUrl = DASHBOARD_PATHS.STUDENT // default
        if (role && isRole(role)) {
            dashboardUrl = DASHBOARD_PATHS[role]
        }
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    // Check if user is trying to access dashboard routes without being logged in
    if (pathname.startsWith("/dashboard") && !token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Role-based dashboard access control
    if (token) {
        const role = token.role as string

        if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/login", request.url))
        }
        if (pathname.startsWith("/dashboard/coach") && role !== "COACH" && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/login", request.url))
        }
        if (pathname.startsWith("/dashboard/player") && role !== "STUDENT" && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
}
