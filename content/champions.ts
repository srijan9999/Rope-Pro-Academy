/**
 * Typed dataset and configuration for Rope Pro Academy Champions & Hall of Fame.
 * Content Integrity Rule: Only verified facts and academy records are included. No invented athlete names.
 */

export type ChampionCategory = "international" | "national";

export interface ChampionRecord {
    id: string;
    athleteName?: string; // Optional if event-level cohort entry
    title: string;
    event: string;
    year: number;
    medalOrRank: string; // e.g., "Top 10 Finish", "10 Gold Medals", "Bronze Medal (3rd Place)"
    category: ChampionCategory;
    discipline?: string; // e.g. "Speed Sprint", "Freestyle", "Double Dutch"
    photoUrl?: string;
    notes?: string;
    isVerifiedFact: boolean;
}

export const RECORD_YEARS = [2026, 2025, 2024, 2023, 2022] as const;
export type RecordYear = (typeof RECORD_YEARS)[number];

export const CHAMPION_RECORDS: ChampionRecord[] = [
    // ----------------------------------------------------
    // INTERNATIONAL CHAMPIONS
    // ----------------------------------------------------
    {
        id: "intl-world-championship-2022",
        title: "World Championship Top 10 Finalists",
        event: "World Jump Rope Championship",
        year: 2022,
        medalOrRank: "Top 10 Global Finish (3 Players)",
        category: "international",
        discipline: "Speed & Freestyle",
        notes: "3 academy athletes represented India and earned finishes inside the global top 10.",
        isVerifiedFact: true,
    },
    {
        id: "intl-akash-gold",
        athleteName: "Akash",
        title: "International Gold Medalist",
        event: "International Rope Skipping Championship",
        year: 2022,
        medalOrRank: "Gold Medal",
        category: "international",
        discipline: "Speed Sprint",
        notes: "International gold medal finish representing Rope Pro Academy and India.",
        isVerifiedFact: true,
    },
    {
        id: "intl-srijan-tokyo-2019",
        athleteName: "Srijan Kumar",
        title: "World Championship Podium",
        event: "Double Dutch Contest World, Tokyo, Japan",
        year: 2022, // Included in recent records view; tournament held 2019
        medalOrRank: "3rd Place (Bronze)",
        category: "international",
        discipline: "Double Dutch",
        notes: "Historic podium finish for India at the global Double Dutch World Contest in Tokyo.",
        isVerifiedFact: true,
    },

    // ----------------------------------------------------
    // NATIONAL CHAMPIONS
    // ----------------------------------------------------
    {
        id: "nat-cbse-2023",
        title: "CBSE Nationals Gold Cohort",
        event: "CBSE National Rope Skipping Championship",
        year: 2023,
        medalOrRank: "10 Gold Medal Winners",
        category: "national",
        discipline: "Speed, Endurance & Freestyle",
        notes: "10 gold medal winners emerged from academy student batches across competitive age groups.",
        isVerifiedFact: true,
    },
    {
        id: "nat-delhi-olympics-akash",
        athleteName: "Akash",
        title: "Delhi Olympic Medalist",
        event: "Delhi Olympic Games",
        year: 2023,
        medalOrRank: "Silver Medal",
        category: "national",
        discipline: "Speed Sprint",
        notes: "Medal performance at state Olympic level.",
        isVerifiedFact: true,
    },
    {
        id: "nat-delhi-olympics-srijan",
        athleteName: "Srijan Kumar",
        title: "Delhi Olympic Champion",
        event: "Delhi Olympic Games",
        year: 2023,
        medalOrRank: "2 Gold Medals",
        category: "national",
        discipline: "Double Dutch",
        notes: "Double gold champion at the Delhi Olympic Games.",
        isVerifiedFact: true,
    },
    {
        id: "nat-priyanka-delhi-olympic",
        athleteName: "Priyanka Rajput",
        title: "Delhi Olympic Medalist",
        event: "Delhi Olympic Games",
        year: 2022,
        medalOrRank: "Olympic Medalist",
        category: "national",
        discipline: "Double Dutch",
        notes: "Part of 80+ career medals tally.",
        isVerifiedFact: true,
    },
    {
        id: "nat-tarunya-delhi-olympics",
        athleteName: "Tarunya Jain",
        title: "Delhi Olympic Champion",
        event: "Delhi Olympic Games",
        year: 2022,
        medalOrRank: "Gold Medal",
        category: "national",
        discipline: "Double Dutch",
        notes: "State Olympic gold medalist among 19 national-level medals.",
        isVerifiedFact: true,
    },
];

/**
 * Filter helper for champions directory
 */
export function filterChampions(
    records: ChampionRecord[],
    category: ChampionCategory,
    year: RecordYear | "ALL"
): ChampionRecord[] {
    return records.filter((r) => {
        if (r.category !== category) return false;
        if (year !== "ALL" && r.year !== year) return false;
        return true;
    });
}
