import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that should only be accessible to guests (non-logged-in users)
const guestOnlyRoutes = ["/", "/login", "/register", "/register/player", "/register/coach"]

// Routes that require authentication
const protectedRoutes = ["/dashboard"]

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const { pathname } = request.nextUrl

    // Check if user is trying to access the home page while logged in
    if (pathname === "/" && token) {
        // Redirect to role-based dashboard
        let dashboardUrl = "/dashboard/player" // default

        if (token.role === "ADMIN") {
            dashboardUrl = "/dashboard/admin"
        } else if (token.role === "COACH") {
            dashboardUrl = "/dashboard/coach"
        } else if (token.role === "STUDENT") {
            dashboardUrl = "/dashboard/player"
        }

        return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    // Check if user is trying to access dashboard routes without being logged in
    if (pathname.startsWith("/dashboard") && !token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
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
