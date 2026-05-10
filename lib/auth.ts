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

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                // Scenario 1: OTP Login
                if (credentials?.otp && credentials?.email) {
                    const identifier = credentials.email.toLowerCase()
                    const token = credentials.otp

                    // Find valid OTP
                    const otpRecord = await prisma.otp.findFirst({
                        where: {
                            identifier,
                            token,
                            type: "LOGIN", // Assuming 'LOGIN' type for login OTPs
                        }
                    })

                    if (!otpRecord) {
                        throw new Error("Invalid or expired OTP")
                    }

                    // Check expiry
                    if (new Date() > otpRecord.expires) {
                        await prisma.otp.delete({ where: { id: otpRecord.id } })
                        throw new Error("OTP expired")
                    }

                    // Delete used OTP
                    await prisma.otp.delete({ where: { id: otpRecord.id } })

                    // Find user
                    const user = await prisma.user.findUnique({
                        where: { email: identifier },
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                        },
                    })

                    if (!user) {
                        throw new Error("User not found")
                    }

                    // Update last login
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLogin: new Date() },
                    })

                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                    }
                }

                // Scenario 2: Password Login
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required")
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase() },
                    select: {
                        id: true,
                        email: true,
                        password: true,
                        role: true,
                        status: true,
                    },
                })

                if (!user) {
                    throw new Error("Invalid email or password")
                }

                // Verify password
                const isValidPassword = await verifyPassword(
                    credentials.password,
                    user.password
                )

                if (!isValidPassword) {
                    throw new Error("Invalid email or password")
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.status = user.status
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.status = token.status
            }
            return session
        },

        async signIn({ user }) {
            // Allow PENDING users to login but features will be restricted
            // If you want to block PENDING users, uncomment the following:
            // if (user.status === "PENDING") {
            //   throw new Error("Your account is pending approval")
            // }

            if (user.status === "INACTIVE") {
                throw new Error("Your account has been deactivated")
            }

            return true
        },
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === "development",
}
