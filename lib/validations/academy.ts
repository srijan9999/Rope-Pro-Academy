import { z } from 'zod'

// Academy Type enum values
export const ACADEMY_TYPES = ['PARTNER_SCHOOL', 'TRAINING_CENTER', 'FRANCHISE'] as const
export type AcademyType = typeof ACADEMY_TYPES[number]

// Academy Status enum values
export const ACADEMY_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'PLANNED'] as const
export type AcademyStatus = typeof ACADEMY_STATUSES[number]

// Create Academy Schema
export const createAcademySchema = z.object({
    name: z.string()
        .min(3, 'Academy name must be at least 3 characters')
        .max(100, 'Academy name too long'),

    location: z.string()
        .min(2, 'Location is required'),

    address: z.string()
        .min(10, 'Please provide full address'),

    description: z.string()
        .max(500, 'Description too long')
        .optional()
        .nullable(),

    contactPhone: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number too long')
        .optional()
        .nullable(),

    contactEmail: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .optional()
        .nullable(),

    locationLat: z.number()
        .min(-90).max(90)
        .optional()
        .nullable(),

    locationLng: z.number()
        .min(-180).max(180)
        .optional()
        .nullable(),

    headCoachId: z.string().optional().nullable(),

    capacity: z.number()
        .int()
        .min(10, 'Minimum capacity is 10 students')
        .max(500, 'Maximum capacity is 500 students')
        .default(50),

    academyType: z.enum(ACADEMY_TYPES).default('TRAINING_CENTER'),

    operatingHours: z.object({
        weekdays: z.string(),
        weekends: z.string()
    }).optional().nullable(),

    facilities: z.array(z.string()).optional().nullable()
})

export type CreateAcademyInput = z.infer<typeof createAcademySchema>

// Update Academy Schema (all fields optional)
export const updateAcademySchema = z.object({
    name: z.string().min(3).max(100).optional(),
    location: z.string().min(2).optional(),
    address: z.string().min(10).optional(),
    description: z.string().max(500).optional().nullable(),
    contactPhone: z.string().min(10).max(15).optional().nullable(),
    contactEmail: z.string().email().toLowerCase().optional().nullable(),
    locationLat: z.number().min(-90).max(90).optional().nullable(),
    locationLng: z.number().min(-180).max(180).optional().nullable(),
    headCoachId: z.string().optional().nullable(),
    capacity: z.number().int().min(10).max(500).optional(),
    academyType: z.enum(ACADEMY_TYPES).optional(),
    status: z.enum(ACADEMY_STATUSES).optional(),
    operatingHours: z.object({
        weekdays: z.string(),
        weekends: z.string()
    }).optional().nullable(),
    facilities: z.array(z.string()).optional().nullable()
})

export type UpdateAcademyInput = z.infer<typeof updateAcademySchema>

// Query Parameters Schema
export const academyQuerySchema = z.object({
    status: z.string().optional(),
    type: z.enum(ACADEMY_TYPES).optional(),
    sortBy: z.enum(['name', 'createdAt', 'capacity', 'status']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export type AcademyQueryParams = z.infer<typeof academyQuerySchema>
