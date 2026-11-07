/**
 * Typed pricing plans configuration for Rope Pro Academy.
 * Content Integrity Rule: Real prices are not invented. Placeholders are clearly marked.
 */

export interface PricingPlan {
    id: string
    slug: string
    name: string
    durationMonths: number
    priceDisplay: string
    billingPeriod: string
    description: string
    features: string[]
    isPlaceholderPrice: boolean
    isBestValue?: boolean
}

export const REGISTRATION_FEE = 2000 // One-time admission/registration fee (separate from recurring plans)

export const PRICING_PLANS: PricingPlan[] = [
    {
        id: "plan-monthly",
        slug: "monthly",
        name: "Monthly Plan",
        durationMonths: 1,
        // TODO: replace with real content - actual rupee amount pending from administration
        priceDisplay: "Contact for pricing",
        billingPeriod: "Per month",
        description: "Flexible month-to-month training for dedicated beginner to advanced athletes.",
        features: [
            "Regular batch coaching sessions",
            "Speed, freestyle & endurance fundamentals",
            "Certified coach supervision & feedback",
            "Standard performance tracking",
        ],
        isPlaceholderPrice: true,
        isBestValue: false,
    },
    {
        id: "plan-3-months",
        slug: "3-months",
        name: "3 Months Plan",
        durationMonths: 3,
        // TODO: replace with real content - actual rupee amount pending from administration
        priceDisplay: "Contact for pricing",
        billingPeriod: "Per 3 months",
        description: "Consistent quarterly training to build muscle memory and competition readiness.",
        features: [
            "All Monthly Plan inclusions",
            "Quarterly skill milestone assessment",
            "Freestyle and double-under mastery",
            "State & district tournament preparation",
        ],
        isPlaceholderPrice: true,
        isBestValue: false,
    },
    {
        id: "plan-6-months",
        slug: "6-months",
        name: "6 Months Plan",
        durationMonths: 6,
        // TODO: replace with real content - actual rupee amount pending from administration
        priceDisplay: "Contact for pricing",
        billingPeriod: "Per 6 months",
        description: "Comprehensive development for athletes targeting national championships.",
        features: [
            "All 3 Months Plan inclusions",
            "Advanced competition routines & combos",
            "Speed drills & endurance benchmarking",
            "Priority batch scheduling",
        ],
        isPlaceholderPrice: true,
        isBestValue: false,
    },
    {
        id: "plan-1-year",
        slug: "1-year",
        name: "1 Year Plan",
        durationMonths: 12,
        // TODO: replace with real content - actual rupee amount pending from administration
        priceDisplay: "Contact for pricing",
        billingPeriod: "Per year",
        description: "Long-term elite athlete program aiming for national and international podiums.",
        features: [
            "All 6 Months Plan inclusions",
            "National & international event preparation",
            "Personalized athlete progress tracking",
            "Guinness / Limca record attempt guidance",
        ],
        isPlaceholderPrice: true,
        isBestValue: false,
    },
]

export const PARTNER_SCHOOLS = [
    "Bal Bharati Public School (Rohini)",
    "Adarsh Public School (Vikaspuri)",
    "Vidya Bharati School (Rohini)",
    "Spring Day's School",
    "Rainbow English Senior Secondary School (Janakpuri)",
    "APS Uttam Nagar",
    "Guru Nanak School",
    "Shishakntran Public School",
    "Columbia Foundation School",
]
