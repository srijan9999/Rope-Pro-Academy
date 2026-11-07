import bcrypt from "bcrypt"
import prisma from "./prisma"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a unique student ID in format: RPA-YEAR-XXXX
 * @returns Generated student ID
 */
export async function generateStudentId(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `RPA-${year}-`

    // Find the highest existing student ID for this year
    const lastStudent = await prisma.student.findFirst({
        where: {
            studentId: {
                startsWith: prefix,
            },
        },
        orderBy: {
            studentId: "desc",
        },
        select: {
            studentId: true,
        },
    })

    let nextNumber = 1
    if (lastStudent) {
        const lastNumber = parseInt(lastStudent.studentId.split("-")[2], 10)
        nextNumber = lastNumber + 1
    }

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
}

/**
 * Generate a unique coach ID in format: COACH-YEAR-XXXX
 * @returns Generated coach ID
 */
export async function generateCoachId(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `COACH-${year}-`

    // Find the highest existing coach ID for this year
    const lastCoach = await prisma.coach.findFirst({
        where: {
            coachId: {
                startsWith: prefix,
            },
        },
        orderBy: {
            coachId: "desc",
        },
        select: {
            coachId: true,
        },
    })

    let nextNumber = 1
    if (lastCoach) {
        const lastNumber = parseInt(lastCoach.coachId.split("-")[2], 10)
        nextNumber = lastNumber + 1
    }

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
}

/**
 * Generate a unique receipt number in format: REC-YEAR-XXXX
 * @returns Generated receipt number
 */
export async function generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `REC-${year}-`

    // Find the highest existing receipt number for this year
    const lastFee = await prisma.fee.findFirst({
        where: {
            receiptNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            receiptNumber: "desc",
        },
        select: {
            receiptNumber: true,
        },
    })

    let nextNumber = 1
    if (lastFee) {
        const lastNumber = parseInt(lastFee.receiptNumber.split("-")[2], 10)
        nextNumber = lastNumber + 1
    }

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
}

/**
 * Validate password strength
 * Requirements: 8+ chars, uppercase, lowercase, number, special character
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export function isPasswordStrong(password: string): boolean {
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial
}

// SEC-08: Pre-computed dummy hash with cost 12 to eliminate timing discrepancy when user is not found
const DUMMY_HASH = bcrypt.hashSync("dummy-password-timing-mitigation-only", 12)

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required")
                }

                // Find user by email
                let user
                try {
                    user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() },
                        select: {
                            id: true,
                            email: true,
                            password: true,
                            role: true,
                            status: true,
                            mustChangePassword: true,
                        },
                    })
                } catch (error: unknown) {
                    // SEC-04: Log code only, throw fixed code SERVICE_UNAVAILABLE
                    const prismaCode = (error && typeof error === "object" && "code" in error) ? (error as { code: string }).code : "UNKNOWN"
                    console.error("Database connection failure in auth lookup:", prismaCode)
                    throw new Error("SERVICE_UNAVAILABLE")
                }

                if (!user || !user.password) {
                    await bcrypt.compare(credentials.password, DUMMY_HASH)
                    throw new Error("INVALID_CREDENTIALS")
                }

                // Verify password
                const isValidPassword = await verifyPassword(
                    credentials.password,
                    user.password
                )

                if (!isValidPassword) {
                    throw new Error("INVALID_CREDENTIALS")
                }

                // Only ACTIVE accounts may authenticate (fail closed)
                // Distinct status messages are returned ONLY after password matches
                if (user.status !== "ACTIVE") {
                    if (user.role === "STUDENT") {
                        if (user.status === "PENDING_PAYMENT") {
                            throw new Error("PENDING_PAYMENT")
                        }
                        if (user.status === "PENDING_VERIFICATION") {
                            throw new Error("PENDING_VERIFICATION")
                        }
                        if (user.status === "PAYMENT_REJECTED") {
                            throw new Error("PAYMENT_REJECTED")
                        }
                    }
                    if (user.role === "COACH" && user.status === "PENDING") {
                        throw new Error("COACH_PENDING")
                    }
                    throw new Error("ACCOUNT_INACTIVE")
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date() },
                })

                // Return user object (without password)
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    mustChangePassword: user.mustChangePassword,
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.status = user.status
                token.mustChangePassword = user.mustChangePassword
            }

            // update() from client: re-read mustChangePassword directly from database
            if (trigger === "update" && token.id) {
                const fresh = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: { mustChangePassword: true, status: true, role: true },
                })
                if (fresh) {
                    token.mustChangePassword = fresh.mustChangePassword
                    token.status = fresh.status
                    token.role = fresh.role
                }
            }

            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.status = token.status
                session.user.mustChangePassword = token.mustChangePassword
            }
            return session
        },

        async signIn({ user }) {
            // Fail closed: only ACTIVE users may authenticate
            if (user.status !== "ACTIVE") {
                return false
            }
            return true
        },
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === "development",
}
