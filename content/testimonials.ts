/**
 * Typed testimonial collection for Rope Pro Academy.
 * Content Integrity Rule: Only verified athlete/coach quotes are published.
 */

export interface TestimonialItem {
    id: string
    name: string
    role: string
    badge?: string
    quote: string
    isPlaceholder?: boolean
    rating: number
    avatarFallback: string
}

export const TESTIMONIALS: TestimonialItem[] = [
    {
        id: "ravina",
        name: "Ravina",
        role: "Delhi Olympics Medalist & SGFI Champion",
        badge: "National Gold Medalist",
        quote:
            "I joined Rope Pro Academy to learn different events in a proper and professional way. The academy has helped me grow with expert guidance, discipline, and motivation.",
        rating: 5,
        avatarFallback: "RA",
    },
    {
        id: "srijan-kumar",
        name: "Srijan Kumar",
        role: "Double Dutch Contest World Bronze Medalist (Tokyo 2019)",
        badge: "International Player",
        quote:
            "Representing the country internationally was made possible by the dedicated guidance and rigor at Rope Pro Academy. We train students using authentic global competitive standards.",
        rating: 5,
        avatarFallback: "SK",
    },
    {
        id: "tarunya-jain",
        name: "Tarunya Jain",
        role: "Delhi Olympics Gold Medalist & Trainer",
        badge: "19+ National Medals",
        quote:
            "We develop students' coordination, endurance, and technique through structured training methods, turning beginners into podium-level athletes.",
        rating: 5,
        avatarFallback: "TJ",
    },
    {
        id: "aniket",
        name: "Aniket",
        role: "Athlete",
        badge: "Academy Athlete",
        // TODO: replace with real content - quote for Aniket pending verified source from administration
        quote:
            "Training at Rope Pro Academy has transformed my speed, focus, and athletic discipline from day one.",
        isPlaceholder: true,
        rating: 5,
        avatarFallback: "AN",
    },
]
