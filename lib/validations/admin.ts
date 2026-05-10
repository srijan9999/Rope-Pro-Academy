import { z } from 'zod'

// User Directory Query Parameter Validation
export const userDirectoryQuerySchema = z.object({
    query: z.string().min(2).max(100).optional(),
    role: z.enum(['STUDENT', 'COACH', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE']).optional(),
    academy: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'email', 'status', 'role']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type UserDirectoryQuery = z.infer<typeof userDirectoryQuerySchema>

// Helper to parse URL search params
export function parseUserDirectoryQuery(searchParams: URLSearchParams): {
    success: true
    data: UserDirectoryQuery
} | {
    success: false
    error: z.ZodError
} {
    const rawParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
        rawParams[key] = value
    })

    const result = userDirectoryQuerySchema.safeParse(rawParams)

    if (result.success) {
        return { success: true, data: result.data }
    }

    return { success: false, error: result.error }
}
