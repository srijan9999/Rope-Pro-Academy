import { z } from 'zod'

// Request Types
export const REQUEST_TYPES = [
    'LEAVE',
    'MEDICAL_LEAVE',
    'PROFILE_UPDATE',
    'ACADEMY_TRANSFER',
    'BATCH_TRANSFER',
    'FEE_CONCESSION',
    'COMPLAINT',
    'QUERY',
    'OTHER'
] as const

export const REQUEST_STATUSES = [
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'RESOLVED'
] as const

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export const LEAVE_TYPES = [
    'CASUAL',
    'MEDICAL',
    'EMERGENCY',
    'PERSONAL',
    'VACATION',
    'EDUCATIONAL'
] as const

// Base request creation schema
export const createRequestSchema = z.object({
    type: z.enum(REQUEST_TYPES),
    category: z.string().optional(),
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
    description: z.string().min(20, 'Please provide detailed description').max(2000),
    priority: z.enum(PRIORITIES).default('MEDIUM'),
    data: z.record(z.string(), z.any()).optional(),
    attachments: z.array(z.string().url()).optional()
})

// Type-specific data schemas
export const leaveRequestDataSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    leaveType: z.enum(LEAVE_TYPES),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    supportingDocument: z.string().url().optional()
}).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'End date must be after or equal to start date' }
)

export const profileUpdateDataSchema = z.object({
    fieldName: z.string().min(1),
    currentValue: z.any(),
    requestedValue: z.any(),
    reason: z.string().min(10, 'Reason must be at least 10 characters')
})

export const transferRequestDataSchema = z.object({
    transferType: z.enum(['ACADEMY', 'BATCH']),
    currentAcademyId: z.string().optional(),
    requestedAcademyId: z.string().optional(),
    currentBatchId: z.string().optional(),
    requestedBatchId: z.string().optional(),
    reason: z.string().min(20, 'Please provide detailed reason'),
    effectiveDate: z.string()
})

export const complaintDataSchema = z.object({
    complaintCategory: z.string().min(1),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    involvedParties: z.array(z.string()).optional()
})

// Admin action schema
export const requestActionSchema = z.object({
    action: z.enum(['APPROVE', 'REJECT', 'UNDER_REVIEW', 'CANCEL']),
    adminNote: z.string().min(3).max(1000).optional(),
    metadata: z.record(z.string(), z.any()).optional()
})

// Query schema for list endpoint
export const requestQuerySchema = z.object({
    status: z.string().optional(), // Comma-separated: PENDING,UNDER_REVIEW
    type: z.string().optional(),
    priority: z.string().optional(),
    requesterRole: z.string().optional(),
    assignedTo: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'priority', 'status', 'type']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type RequestActionInput = z.infer<typeof requestActionSchema>
export type RequestQueryInput = z.infer<typeof requestQuerySchema>
export type LeaveRequestData = z.infer<typeof leaveRequestDataSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateDataSchema>
export type TransferRequestData = z.infer<typeof transferRequestDataSchema>

// Player Portal Schemas

// Frontend: Request Leave Modal Schema
export const requestLeaveSchema = z.object({
    leaveType: z.enum(LEAVE_TYPES),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string()
        .min(20, 'Please provide a detailed reason (minimum 20 characters)')
        .max(500, 'Reason is too long (maximum 500 characters)'),
    supportingDocument: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    parentAcknowledged: z.boolean().default(false)
}).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
        message: 'End date must be on or after start date',
        path: ['endDate']
    }
).refine(
    (data) => {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= 30
    },
    {
        message: 'Leave duration cannot exceed 30 days',
        path: ['endDate']
    }
)

// Backend: Create Player Request API Schema
export const createPlayerRequestSchema = z.object({
    type: z.enum(REQUEST_TYPES),
    category: z.string().optional(),
    subject: z.string().min(5),
    description: z.string().min(20),
    priority: z.enum(PRIORITIES).default('MEDIUM'),
    data: z.record(z.string(), z.any())
})

export type RequestLeaveInput = z.infer<typeof requestLeaveSchema>
export type CreatePlayerRequestInput = z.infer<typeof createPlayerRequestSchema>
