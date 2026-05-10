import { z } from "zod"

// Password validation schema with strong requirements
export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
    )

// Email validation schema
export const emailSchema = z.string().email("Invalid email address")

// Role enum
export const roleSchema = z.enum(["STUDENT", "COACH"], {
    message: "Role must be either STUDENT or COACH",
})

// Gender enum
export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]).optional()

// Skill level enum
export const skillLevelSchema = z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "COMPETITIVE"])
    .optional()

// Specialization enum
export const specializationSchema = z
    .enum(["SPEED", "FREESTYLE", "DOUBLE_DUTCH", "TEAM_DEMO", "FITNESS"])
    .optional()

// Base registration schema (common fields)
const baseRegistrationSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
        .string()
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number")
        .optional(),
})

// Student registration schema
export const studentRegistrationSchema = baseRegistrationSchema.extend({
    role: z.literal("STUDENT"),
    dateOfBirth: z.string().optional(),
    gender: genderSchema,
    parentName: z.string().optional(),
    parentPhone: z
        .string()
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number")
        .optional(),
    parentEmail: z.string().email().optional().or(z.literal("")),
    schoolName: z.string().optional(),
    grade: z.string().optional(),
    academyId: z.string().optional(),
    skillLevel: skillLevelSchema,
    bloodGroup: z.string().optional(),
    medicalConditions: z.string().optional(),
})

// Coach registration schema
export const coachRegistrationSchema = baseRegistrationSchema.extend({
    role: z.literal("COACH"),
    dateOfBirth: z.string().optional(),
    gender: genderSchema,
    experienceYears: z.number().int().min(0).optional(),
    coachingYears: z.number().int().min(0).optional(),
    specialization: specializationSchema,
    qualifications: z.string().optional(),
    address: z.string().optional(),
    ropeSkippingJourney: z.string().optional(),
    coachingPhilosophy: z.string().optional(),
})

// Combined registration schema (discriminated union)
export const registrationSchema = z.discriminatedUnion("role", [
    studentRegistrationSchema,
    coachRegistrationSchema,
])

// Login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
})

// Types derived from schemas
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>
export type CoachRegistrationInput = z.infer<typeof coachRegistrationSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
export type LoginInput = z.infer<typeof loginSchema>

// Validation helper function
export function validateRegistration(data: unknown): {
    success: boolean
    data?: RegistrationInput
    errors?: z.ZodError
} {
    const result = registrationSchema.safeParse(data)
    if (result.success) {
        return { success: true, data: result.data }
    }
    return { success: false, errors: result.error }
}

// Format Zod errors for API response
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {}
    for (const issue of error.issues) {
        const path = issue.path.join(".")
        if (!formatted[path]) {
            formatted[path] = []
        }
        formatted[path].push(issue.message)
    }
    return formatted
}
