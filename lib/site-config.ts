/**
 * Centralized site configuration and figures for Rope Pro Academy.
 * All core statistics, institutional copy, and ID card configurations live here.
 */

export const siteConfig = {
    name: "Rope Pro Academy",
    shortName: "RPA",
    tagline: "Train like a Pro, Perform like a Champion",
    themeColor: "#E63946",
    foundingYear: 2015,
    url: "https://ropeproacademy.com",
    domain: "www.ropeproacademy.com",
    stats: {
        studentsTrained: 1000,
        studentsTrainedDisplay: "1000+",
        internationalPlayers: 16,
        internationalPlayersDisplay: "16",
        foundingYear: 2015,
        foundingYearDisplay: "Founding Year: 2015",
    },
    mission: {
        headline:
            "To inspire a generation of athletes through discipline, innovation, and dedication in the field of rope skipping, fostering both physical and mental growth.",
        supporting:
            "Our mission goes beyond mere sporting achievements. We are committed to nurturing well-rounded individuals who excel not only in sports but in all facets of life: physically fit, mentally sharp, and socially responsible.",
    },
    vision:
        "Rope Pro Academy envisions a future where rope skipping is recognized globally as both a competitive sport and a lifestyle choice, blending fitness, creativity, and community.",
    whyChoosePoints: [
        {
            title: "Safe & Supportive Environment",
            description: "A safe, supportive environment for every student to learn and thrive.",
        },
        {
            title: "Top-Quality Equipment",
            description: "Top-quality training equipment designed for professional rope skipping.",
        },
        {
            title: "Strong Teamwork Community",
            description: "A strong community that encourages teamwork, camaraderie, and mutual respect.",
        },
        {
            title: "Age-Appropriate Programs",
            description: "Age-appropriate programs customized for athletes from ages 5 to 40.",
        },
        {
            title: "Experienced Passionate Instructors",
            description: "Experienced, passionate instructors dedicated to student advancement.",
        },
        {
            title: "Pathway to Competition",
            description: "A path from beginner fundamentals to national and international competition.",
        },
    ],
    contact: {
        email: "teamvgacs@gmail.com",
        phone: "8470039884, 9899908098",
        phones: ["8470039884", "9899908098"],
        address: "Rohini, Delhi",
        hours: "Mon-Sat, 6:00 AM - 8:00 PM",
    },
    socials: {
        facebook: "https://facebook.com/ropeproacademy",
        instagram: "https://instagram.com/ropeproacademy",
        youtube: "https://youtube.com/@ropeproacademy",
    },
    // Official ID Card Signatories (Decision 7)
    signatories: [
        {
            name: "RAVI PASWAN",
            title: "Founder",
            signatureFile: "/signatures/ravi-paswan.png",
        },
        {
            name: "ANIKET DHIMAN",
            title: "Technical Head",
            signatureFile: "/signatures/aniket-dhiman.png",
        },
        {
            name: "MUKESH KUMAR",
            title: "Head Coach",
            signatureFile: "/signatures/mukesh-kumar.png",
        },
    ],
} as const

export const SITE_CONFIG = siteConfig
export type SiteConfig = typeof siteConfig
