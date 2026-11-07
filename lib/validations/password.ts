import { z } from "zod"

export const updatePasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Use at least 8 characters")
            .max(72, "Use 72 characters or fewer") // bcrypt ignores anything past 72 bytes
            .regex(/[a-z]/, "Include a lowercase letter")
            .regex(/[A-Z]/, "Include an uppercase letter")
            .regex(/[0-9]/, "Include a number"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    })

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
