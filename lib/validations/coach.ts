import { z } from "zod"

// ============================================
// COACH REGISTRATION VALIDATION SCHEMAS
// Per-step validation + combined full schema
// ============================================

// Step 1: Personal Info
export const coachStep1Schema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

// Step 2: Address
export const coachStep2Schema = z.object({
    addressLine1: z.string().min(5, "Address is required (min 5 chars)"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
})

// Step 3: Professional
export const coachStep3Schema = z.object({
    specializations: z.array(z.string()).min(1, "Select at least one specialization"),
    experienceYears: z.number().int().min(0).max(50),
    bio: z.string().min(20, "Bio must be at least 20 characters").max(1000),
    education: z.string().optional(),
    previousExperience: z.string().optional(),
})

// Step 4: Skills
export const coachStep4Schema = z.object({
    skillLevels: z.object({
        speed: z.number().min(1).max(10),
        freestyle: z.number().min(1).max(10),
        endurance: z.number().min(1).max(10),
        technique: z.number().min(1).max(10),
    }),
    languages: z.array(z.string()).min(1, "Select at least one language"),
    ageGroups: z.array(z.string()).min(1, "Select at least one age group"),
})

// Step 5: Availability
export const coachStep5Schema = z.object({
    availableDays: z.array(z.string()).min(1, "Select at least one day"),
    availableTimes: z.record(z.array(z.string())).optional(),
    employmentType: z.string().min(1, "Employment type is required"),
    maxBatches: z.number().int().min(1).max(10).optional(),
})

// Combined full registration schema (for API)
export const coachFullRegistrationSchema = z.object({
    // Step 1
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().min(10),
    dateOfBirth: z.string().min(1),
    gender: z.string().min(1),

    // Step 2
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().regex(/^\d{6}$/),

    // Step 3
    specializations: z.array(z.string()).min(1),
    experienceYears: z.number().int().min(0).max(50),
    bio: z.string().min(20).max(1000),
    education: z.string().optional(),
    previousExperience: z.string().optional(),

    // Step 4
    skillLevels: z.object({
        speed: z.number().min(1).max(10),
        freestyle: z.number().min(1).max(10),
        endurance: z.number().min(1).max(10),
        technique: z.number().min(1).max(10),
    }),
    languages: z.array(z.string()).min(1),
    ageGroups: z.array(z.string()).min(1),

    // Step 5
    availableDays: z.array(z.string()).min(1),
    availableTimes: z.record(z.array(z.string())).optional(),
    employmentType: z.string().min(1),
    maxBatches: z.number().int().min(1).max(10).optional(),

    // Step 6 - Documents (file names only for now)
    documents: z.object({
        resume: z.string().optional(),
        idProof: z.string().optional(),
        certificates: z.array(z.string()).optional(),
    }).optional(),
})

// Types
export type CoachStep1Data = z.infer<typeof coachStep1Schema>
export type CoachStep2Data = z.infer<typeof coachStep2Schema>
export type CoachStep3Data = z.infer<typeof coachStep3Schema>
export type CoachStep4Data = z.infer<typeof coachStep4Schema>
export type CoachStep5Data = z.infer<typeof coachStep5Schema>
export type CoachRegistrationData = z.infer<typeof coachFullRegistrationSchema>
