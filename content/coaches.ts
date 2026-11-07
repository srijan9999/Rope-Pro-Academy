/**
 * Typed coaches dataset and filter types for Rope Pro Academy.
 * Sourced from verified academy profiles and prompt specifications.
 */

export type CoachFilter = "professional" | "guinness" | "international" | "limca";

export interface CoachProfile {
    id: string;
    slug: string;
    name: string;
    role: string;
    specialization: string;
    experience: string;
    achievements: string[];
    bio: string;
    photoUrl?: string;
    isGuinnessHolder: boolean;
    isLimcaHolder: boolean;
    isInternationalPlayer: boolean;
    isActive: boolean;
    dataQualityNote?: string;
}

export const COACH_FILTER_TABS: { id: CoachFilter; label: string }[] = [
    { id: "professional", label: "Professional Coaches" },
    { id: "guinness", label: "Guinness World Record Holders" },
    { id: "international", label: "International Players" },
    { id: "limca", label: "Limca Book Record Holders" },
];

export const COACH_PROFILES: CoachProfile[] = [
    {
        id: "coach-akash",
        slug: "akash",
        name: "Akash",
        role: "Head Coach & Record Holder",
        specialization: "Speed",
        experience: "16 years",
        achievements: [
            "Guinness World Record Holder",
            "Limca Book Record Holder",
            "International Gold Medalist",
            "50+ National Medals",
            "Silver Medal - Delhi Olympics",
        ],
        bio: "I wanted to share not just my achievements, but also the skills, knowledge, and motivation I've gained over the years.",
        isGuinnessHolder: true,
        isLimcaHolder: true,
        isInternationalPlayer: true,
        isActive: true,
    },
    {
        id: "coach-amit-pal",
        slug: "amit-pal",
        name: "Amit Pal",
        // Note: Source doc had typo "Higesh Record Holder"
        role: "Record Holder & Coach",
        specialization: "Speed",
        experience: "11 years",
        achievements: [
            "3 Guinness World Records",
            "4 Limca Book Records",
            "10 National Medals",
            "India Book of Records Holder",
        ],
        bio: "Rope skipping has become more than just Sport; it transformed into a form of artistic expression and meditation.",
        isGuinnessHolder: true,
        isLimcaHolder: true,
        isInternationalPlayer: false,
        isActive: true,
        dataQualityNote: "Source document notes: designation read 'Higesh Record Holder' and graduation year read '20223'.",
    },
    {
        id: "coach-srijan-kumar",
        slug: "srijan-kumar",
        name: "Srijan Kumar",
        role: "International Competitor & Trainer",
        specialization: "Double Dutch",
        experience: "10 years",
        achievements: [
            "3rd Place, Double Dutch Contest World, Tokyo, Japan 2019",
            "7 Gold, 2 Silver, 2 Bronze (National level)",
            "2 Gold (Delhi Olympics)",
        ],
        bio: "International competitor bringing global competition standards to the academy.",
        isGuinnessHolder: false,
        isLimcaHolder: false,
        isInternationalPlayer: true,
        isActive: true,
    },
    {
        id: "coach-priyanka-rajput",
        slug: "priyanka-rajput",
        name: "Priyanka Rajput",
        role: "Coach",
        specialization: "Double Dutch",
        experience: "11 years",
        achievements: [
            "Limca Book Record Holder",
            "15+ National Medals",
            "Delhi Olympic Medal",
            "80+ Total Medals",
        ],
        bio: "I joined as a student and all time I win only gold medals of my 7 years of student journey.",
        isGuinnessHolder: false,
        isLimcaHolder: true,
        isInternationalPlayer: false,
        isActive: true,
    },
    {
        id: "coach-saurav-jha",
        slug: "saurav-jha",
        name: "Saurav Jha",
        role: "Coach & Record Holder",
        specialization: "Speed & Endurance",
        // TODO: replace with real content - experience year pending confirmation
        experience: "Senior Coach",
        achievements: [
            "Limca Book Record Holder",
            "National Championship Medalist",
        ],
        bio: "Dedicated coach focusing on speed step acceleration and competition mindset.",
        isGuinnessHolder: false,
        isLimcaHolder: true,
        isInternationalPlayer: false,
        isActive: true,
    },
    {
        id: "coach-ankita-bhadoria",
        slug: "ankita-bhadoria",
        name: "Ankita Bhadoria",
        role: "Coach & Record Holder",
        specialization: "Freestyle",
        // TODO: replace with real content - experience year pending confirmation
        experience: "Senior Coach",
        achievements: [
            "Limca Book Record Holder",
            "National Championship Competitor",
        ],
        bio: "Specializing in freestyle choreography, footwork rhythm, and routine precision.",
        isGuinnessHolder: false,
        isLimcaHolder: true,
        isInternationalPlayer: false,
        isActive: true,
    },
    {
        id: "coach-diya",
        slug: "diya",
        name: "Diya",
        role: "Coach & Record Holder",
        specialization: "Speed",
        // TODO: replace with real content - experience year pending confirmation
        experience: "Coach",
        achievements: [
            "Limca Book Record Holder",
            "State & National Medalist",
        ],
        bio: "Guiding emerging athletes through fundamental agility, rhythm, and speed drills.",
        isGuinnessHolder: false,
        isLimcaHolder: true,
        isInternationalPlayer: false,
        isActive: true,
    },
    {
        id: "coach-ganesh-sahni",
        slug: "ganesh-sahni",
        name: "Ganesh Sahni",
        role: "Coach & Record Holder",
        specialization: "Freestyle & Speed",
        experience: "10 years",
        achievements: [
            "Limca Book Record Holder",
            "National Championship Medalist",
        ],
        bio: "Instilling discipline, stamina, and competitive excellence in youth squads.",
        isGuinnessHolder: false,
        isLimcaHolder: true,
        isInternationalPlayer: false,
        isActive: true,
        dataQualityNote: "Source document notes: 'Associated Since' reads '10 year' and conflicts with stated total experience.",
    },
    {
        id: "coach-ravina",
        slug: "ravina",
        name: "Ravina",
        role: "Coach",
        specialization: "Double Dutch",
        experience: "5 years",
        achievements: [
            "6 National Medals",
            "2 Delhi Olympic Medals",
            "Gold in all three events at SGFI 2017",
        ],
        bio: "Rope Pro Academy helped me grow with expert guidance, discipline, and motivation.",
        isGuinnessHolder: false,
        isLimcaHolder: false,
        isInternationalPlayer: false,
        isActive: true,
    },
    {
        id: "coach-tarunya-jain",
        slug: "tarunya-jain",
        name: "Tarunya Jain",
        role: "Trainer",
        specialization: "Double Dutch",
        experience: "9 years",
        achievements: [
            "19 National Medals",
            "Gold Medal - Delhi Olympics",
            "International level bronze medalist",
        ],
        bio: "Develop students coordination, endurance, and technique through structured training methods.",
        isGuinnessHolder: false,
        isLimcaHolder: false,
        // Flagged for user confirmation: Listed with 'International level bronze medalist' in achievements
        isInternationalPlayer: false,
        isActive: true,
        dataQualityNote: "Existing achievement mentions 'International level bronze medalist' - pending user confirmation before adding to International Players tab.",
    },
];

/**
 * Filter helper matching coach profiles against the selected filter tab.
 * Professional Coaches = all active coaches (default).
 */
export function filterCoaches(coaches: CoachProfile[], filter: CoachFilter): CoachProfile[] {
    return coaches.filter((coach) => {
        if (!coach.isActive) return false;
        switch (filter) {
            case "guinness":
                return coach.isGuinnessHolder;
            case "international":
                return coach.isInternationalPlayer;
            case "limca":
                return coach.isLimcaHolder;
            case "professional":
            default:
                return true;
        }
    });
}
