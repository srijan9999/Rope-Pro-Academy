import { z } from "zod"
import { SCHOOLS, PLANS } from "@/lib/pricing"

const schoolKeys = SCHOOLS.map((s) => s.key) as [string, ...string[]]
const planKeys = PLANS.map((p) => p.key) as [string, ...string[]]

export const studentRegistrationSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Please select your gender"),
    schoolName: z.string().min(2, "Regular school name is required"),
    grade: z.string().optional(),

    // Contact
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number"),
    address: z.string().min(5, "Address is required"),

    // Parent / Guardian
    parentName: z.string().min(2, "Parent/Guardian name is required"),
    parentRelation: z.string().min(1, "Relationship is required"),
    parentPhone: z
        .string()
        .min(10, "Parent phone must be at least 10 digits")
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number"),
    parentEmail: z.string().email("Invalid email").or(z.literal("")).optional(),

    // Health & Emergency
    bloodGroup: z.string().min(1, "Blood group is required"),
    medicalConditions: z.string().optional(),
    emergencyContact: z.string().min(2, "Emergency contact name is required"),
    emergencyPhone: z
        .string()
        .min(10, "Emergency phone is required")
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number"),

    // Academy Centre & Plan (Location-based Pricing)
    // Note: Do NOT include feeAmount here — it is computed strictly server-side
    school: z.enum(schoolKeys, {
        message: "Please select an academy centre",
    }),
    plan: z.enum(planKeys, {
        message: "Please select a plan",
    }),
    preferredTiming: z.string().min(1, "Please select preferred timing"),
    experienceLevel: z.string().min(1, "Please select experience level"),

    // Consents
    termsAccepted: z.boolean().refine((v) => v === true, {
        message: "You must accept the Terms & Conditions",
    }),
    mediaConsent: z.boolean().optional(),
    medicalConsent: z.boolean().refine((v) => v === true, {
        message: "You must authorize emergency medical treatment",
    }),
})

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>
