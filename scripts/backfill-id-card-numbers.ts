/**
 * ID Card Number Backfill Script (Phase 2)
 *
 * Scans active Student and Coach records missing an `idCardNumber` and assigns
 * unique, sequential, immutable numbers (e.g. RPA-PL26001, RPA-CH26001).
 *
 * SAFETY REQUIREMENTS:
 * - Requires CONFIRM_DB_HOST matching normalized endpoint of LIVE_DATABASE_URL.
 * - Defaults to DRY-RUN mode (zero writes). Pass --apply to persist changes.
 *
 * Usage (PowerShell):
 *   # 1. Dry run inspection:
 *   $env:CONFIRM_DB_HOST = "<endpoint-id>"
 *   npx tsx scripts/backfill-id-card-numbers.ts
 *
 *   # 2. Apply backfill to target database:
 *   npx tsx scripts/backfill-id-card-numbers.ts --apply
 *   Remove-Item Env:\CONFIRM_DB_HOST
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function getNormalizedEndpointId(dbUrlStr: string): string {
    const match = dbUrlStr.match(/ep-[a-z0-9-]+/)
    if (!match) return ""
    return match[0].replace(/-pooler$/, "")
}

function verifyHostGuard(): void {
    const dbUrl = process.env.LIVE_DATABASE_URL || process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("❌ ERROR: Neither LIVE_DATABASE_URL nor DATABASE_URL is set.")
        process.exit(1)
    }

    const actualEndpoint = getNormalizedEndpointId(dbUrl)
    if (!actualEndpoint) return

    const confirmed = (process.env.CONFIRM_DB_HOST || process.env.CONFIRM_ENDPOINT_ID)?.trim()
    const confirmedNorm = confirmed ? (getNormalizedEndpointId(confirmed) || confirmed) : ""

    if (!confirmedNorm) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST is not set.\n` +
            `Please run with CONFIRM_DB_HOST="${actualEndpoint}" to verify target database.`
        )
        process.exit(1)
    }

    if (confirmedNorm !== actualEndpoint) {
        console.error(
            `❌ SAFETY CHECK FAILED: CONFIRM_DB_HOST ('${confirmedNorm}') does not match actual endpoint ('${actualEndpoint}'). Aborting.`
        )
        process.exit(1)
    }
}

async function main() {
    verifyHostGuard()

    const isApply = process.argv.includes("--apply")
    const year = new Date().getFullYear() % 100 // e.g. 26

    console.log(`\n========================================`)
    console.log(`  ID CARD NUMBER BACKFILL SCRIPT`)
    console.log(`  Mode: ${isApply ? "🚀 APPLY (WRITING CHANGES)" : "🔍 DRY RUN (READ ONLY)"}`)
    console.log(`  Target Year: 20${year} (Prefix: 26)`)
    console.log(`========================================\n`)

    // 1. Fetch active students without an ID card number
    const students = await prisma.student.findMany({
        where: {
            user: { status: "ACTIVE" },
            idCardNumber: null,
        },
        select: {
            id: true,
            studentId: true,
            fullName: true,
            user: { select: { email: true } },
        },
        orderBy: { createdAt: "asc" },
    })

    // 2. Fetch active coaches without an ID card number
    const coaches = await prisma.coach.findMany({
        where: {
            user: { status: "ACTIVE" },
            idCardNumber: null,
        },
        select: {
            id: true,
            coachId: true,
            fullName: true,
            user: { select: { email: true } },
        },
        orderBy: { createdAt: "asc" },
    })

    console.log(`Found ${students.length} active student(s) without idCardNumber.`)
    console.log(`Found ${coaches.length} active coach(es) without idCardNumber.\n`)

    if (students.length === 0 && coaches.length === 0) {
        console.log("✓ All active accounts already have an idCardNumber assigned. Nothing to backfill.")
        return
    }

    // 3. Process students
    let currentPlSeq = 0
    const plCounter = await prisma.idCardCounter.findUnique({
        where: { role_year: { role: "PL", year } },
    })
    currentPlSeq = plCounter?.lastSeq ?? 0

    console.log(`--- Students (Current PL sequence: ${currentPlSeq}) ---`)
    for (const s of students) {
        currentPlSeq++
        const simulatedNumber = `RPA-PL${year}${String(currentPlSeq).padStart(3, "0")}`
        console.log(`  [Student] ID: ${s.studentId} -> ${simulatedNumber}`)

        if (isApply) {
            await prisma.$transaction(async (tx) => {
                await tx.idCardCounter.upsert({
                    where: { role_year: { role: "PL", year } },
                    update: { lastSeq: currentPlSeq },
                    create: { role: "PL", year, lastSeq: currentPlSeq },
                })
                await tx.student.update({
                    where: { id: s.id },
                    data: { idCardNumber: simulatedNumber },
                })
            })
        }
    }

    // 4. Process coaches
    let currentChSeq = 0
    const chCounter = await prisma.idCardCounter.findUnique({
        where: { role_year: { role: "CH", year } },
    })
    currentChSeq = chCounter?.lastSeq ?? 0

    console.log(`\n--- Coaches (Current CH sequence: ${currentChSeq}) ---`)
    for (const c of coaches) {
        currentChSeq++
        const simulatedNumber = `RPA-CH${year}${String(currentChSeq).padStart(3, "0")}`
        console.log(`  [Coach] ID: ${c.coachId} -> ${simulatedNumber}`)

        if (isApply) {
            await prisma.$transaction(async (tx) => {
                await tx.idCardCounter.upsert({
                    where: { role_year: { role: "CH", year } },
                    update: { lastSeq: currentChSeq },
                    create: { role: "CH", year, lastSeq: currentChSeq },
                })
                await tx.coach.update({
                    where: { id: c.id },
                    data: { idCardNumber: simulatedNumber },
                })
            })
        }
    }

    console.log(`\n========================================`)
    if (isApply) {
        console.log(`✓ Backfill complete: successfully assigned ID numbers to ${students.length} students and ${coaches.length} coaches.`)
    } else {
        console.log(`✓ Dry run complete: simulated ID numbers for ${students.length} students and ${coaches.length} coaches.`)
        console.log(`To write these changes to the database, run with --apply and CONFIRM_DB_HOST.`)
    }
    console.log(`========================================\n`)
}

main()
    .catch((err) => {
        console.error("Backfill script error:", err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
