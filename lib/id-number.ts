import "server-only"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type IdCardRole = "PL" | "CH"

/**
 * Concurrency-safe atomic ID card number generator.
 *
 * Format: RPA-<ROLE><YEAR><SEQ>
 * Examples:
 * - Student: RPA-PL26001 (Player/Student in 2026, sequence #1)
 * - Coach:   RPA-CH26001 (Coach in 2026, sequence #1)
 *
 * Guaranteed atomic and sequential via PostgreSQL ON CONFLICT row locking
 * on the unique (role, year) constraint in id_card_counters table.
 */
export async function generateNextIdCardNumber(
    tx: Prisma.TransactionClient | typeof prisma,
    role: IdCardRole,
    overrideYear?: number
): Promise<string> {
    const fullYear = overrideYear ?? new Date().getFullYear()
    const twoDigitYear = fullYear % 100 // e.g. 2026 -> 26

    // Atomically increment the sequence for (role, year)
    const counter = await tx.idCardCounter.upsert({
        where: {
            role_year: {
                role,
                year: twoDigitYear,
            },
        },
        update: {
            lastSeq: { increment: 1 },
        },
        create: {
            role,
            year: twoDigitYear,
            lastSeq: 1,
        },
        select: {
            lastSeq: true,
        },
    })

    const seqStr = String(counter.lastSeq).padStart(3, "0")
    return `RPA-${role}${twoDigitYear}${seqStr}`
}

/**
 * Issue an immutable ID card number to a student if they don't already have one.
 * Called in the approval transaction when a student transitions to ACTIVE.
 */
export async function ensureStudentIdCardNumber(
    studentId: string
): Promise<string>
export async function ensureStudentIdCardNumber(
    tx: Prisma.TransactionClient | typeof prisma,
    studentId: string
): Promise<string>
export async function ensureStudentIdCardNumber(
    first: Prisma.TransactionClient | typeof prisma | string,
    second?: string
): Promise<string> {
    const isFirstString = typeof first === "string"
    const tx = isFirstString ? prisma : first
    const studentId = isFirstString ? first : second!

    const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { id: true, idCardNumber: true },
    })

    if (!student) {
        throw new Error(`Student ${studentId} not found`)
    }

    if (student.idCardNumber) {
        return student.idCardNumber
    }

    const nextNumber = await generateNextIdCardNumber(tx, "PL")
    await tx.student.update({
        where: { id: studentId },
        data: { idCardNumber: nextNumber },
    })

    return nextNumber
}

/**
 * Issue an immutable ID card number to a coach if they don't already have one.
 * Called in the coach approval transaction when a coach transitions to ACTIVE.
 */
export async function ensureCoachIdCardNumber(
    coachId: string
): Promise<string>
export async function ensureCoachIdCardNumber(
    tx: Prisma.TransactionClient | typeof prisma,
    coachId: string
): Promise<string>
export async function ensureCoachIdCardNumber(
    first: Prisma.TransactionClient | typeof prisma | string,
    second?: string
): Promise<string> {
    const isFirstString = typeof first === "string"
    const tx = isFirstString ? prisma : first
    const coachId = isFirstString ? first : second!

    const coach = await tx.coach.findUnique({
        where: { id: coachId },
        select: { id: true, idCardNumber: true },
    })

    if (!coach) {
        throw new Error(`Coach ${coachId} not found`)
    }

    if (coach.idCardNumber) {
        return coach.idCardNumber
    }

    const nextNumber = await generateNextIdCardNumber(tx, "CH")
    await tx.coach.update({
        where: { id: coachId },
        data: { idCardNumber: nextNumber },
    })

    return nextNumber
}
