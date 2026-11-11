// NO server-only imports here: used by the client form AND the API.
export const SCHOOLS = [
    { key: "bbps-rohini", label: "BBPS Rohini", fullName: "Bal Bharati Public School, Rohini" },
    { key: "vikas-puri", label: "Vikas Puri", fullName: "Vikas Puri Branch" },
    { key: "dis", label: "DIS", fullName: "Delhi International School (DIS)" },
] as const

export const PLANS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "half-yearly", label: "Half-Yearly", months: 6 },
] as const

export type SchoolKey = (typeof SCHOOLS)[number]["key"]
export type PlanKey = (typeof PLANS)[number]["key"]

export const FEES: Record<SchoolKey, Record<PlanKey, number>> = {
    "bbps-rohini": { monthly: 2000, quarterly: 4500, "half-yearly": 8400 },
    "vikas-puri": { monthly: 1200, quarterly: 3000, "half-yearly": 6000 },
    dis: { monthly: 2000, quarterly: 5100, "half-yearly": 9600 },
}

export function getFee(school: string, plan: string): number | null {
    return (FEES as Record<string, Record<string, number>>)[school]?.[plan] ?? null
}

export const labelFor = (list: readonly { key: string; label: string }[], key: string) =>
    list.find((i) => i.key === key)?.label ?? key

export function getFullNameForSchool(key: string | null | undefined): string {
    if (!key) return ""
    const match = (SCHOOLS as readonly { key: string; label: string; fullName: string }[]).find((s) => s.key === key)
    return match ? (match.fullName || match.label) : key
}

export const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
