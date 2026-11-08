import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string // "ADMIN" | "COACH" | "STUDENT"
            status: string // "ACTIVE" | "INACTIVE" | "PENDING"
            mustChangePassword?: boolean
            revoked?: boolean
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string
        role: string // "ADMIN" | "COACH" | "STUDENT"
        status: string // "ACTIVE" | "INACTIVE" | "PENDING"
        mustChangePassword?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string
        role: string // "ADMIN" | "COACH" | "STUDENT"
        status: string // "ACTIVE" | "INACTIVE" | "PENDING"
        mustChangePassword?: boolean
        lastChecked?: number
        revoked?: boolean
    }
}
