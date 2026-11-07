import { siteConfig } from "./site-config";

export const SITE_CONFIG = {
  name: siteConfig.name,
  founder: "Mr. Ravi Paswan",
  founded: siteConfig.foundingYear,
  tagline: siteConfig.tagline,
  description: siteConfig.mission.headline,
  vision: siteConfig.vision,
  contact: {
    email: "info@roproacademy.com",
    phone: "+91-9876543210", // Placeholder, need real number
    address: "Sector 14, Rohini, Delhi",
    hours: "Mon-Sat, 6:00 AM - 8:00 PM"
  },
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com"
  }
};

export const HERO_CONTENT = {
  headline: "ROPE PRO ACADEMY",
  subheadline: `Founded ${siteConfig.foundingYear} by Mr. Ravi Paswan - ${siteConfig.tagline}`,
  tagline: siteConfig.tagline,
  cta: [
    { text: "Register Now", href: "/register" },
    { text: "Explore Programs", href: "/programs" },
    { text: "Watch Our Story", href: "/about-us" }
  ]
};

export const GLOBAL_RECOGNITION = [
  { count: "7", label: "Guinness World Record Holders", icon: "Trophy" },
  { count: "2", label: "India Book Record Holders", icon: "Book" },
  { count: "3", label: "Limca Book Record Holders", icon: "BookOpen" },
  { count: "100+", label: "National Champions", icon: "Medal" },
  { count: `${siteConfig.stats.internationalPlayers}`, label: "International Players", icon: "Globe" },
  { count: siteConfig.stats.studentsTrainedDisplay, label: "Students Trained", icon: "Users" },
  { count: "200+", label: "Demonstrations & Events", icon: "Calendar" },
  { count: "15+", label: "Professional Coaches", icon: "UserCheck" }
];

export const PROGRAMS = [
  {
    title: "Beginner's Basics",
    ageGroup: "5+ years",
    description: "Fundamental techniques and strong foundation",
    focus: [
      "Mastering basic jumps and footwork",
      "Developing rhythm, balance, and coordination",
      "Building stamina and cardiovascular fitness"
    ],
    duration: "3-6 months",
    price: "₹2,000/month",
    icon: "Activity"
  },
  {
    title: "Intermediate Mastery",
    ageGroup: "8+ years",
    description: "Refining skills to the next level",
    focus: [
      "Advanced techniques: double unders, crossovers, speed skills",
      "Enhancing agility through freestyle combinations",
      "Competition-level routines introduction"
    ],
    duration: "6-12 months",
    price: "₹2,500/month",
    icon: "Zap"
  },
  {
    title: "Advanced Training",
    ageGroup: "12+ years",
    description: "Elite athlete development",
    focus: [
      "Acrobatics and intricate freestyle tricks",
      "Conditioning for endurance and strength",
      "Competitive environment simulation"
    ],
    duration: "Ongoing",
    price: "₹3,000/month",
    icon: "Award"
  },
  {
    title: "Specialized Programs",
    ageGroup: "All Ages",
    description: "Focused training for specific disciplines",
    focus: [
      "Double Dutch Training: Teamwork and coordination",
      "Freestyle Routines: Creativity and precision",
      "Speed Training: Competition speed techniques",
      "Fitness Programs: Blended with strength and cardio"
    ],
    duration: "Flexible",
    price: "₹2,800/month",
    icon: "Star"
  }
];

export const LOCATIONS = [
  {
    id: 1,
    name: "Bal Bharati Public School (Rohini)",
    address: "Sector 14, Rohini, Delhi",
    type: "Partner School Academy",
    timings: "Morning & Evening batches",
    contact: "+91-9876543210",
    embedLink: "https://www.google.com/maps/embed?pb=..."
  },
  {
    id: 2,
    name: "Adarsh Public School (Vikaspuri)",
    address: "Vikaspuri, West Delhi",
    type: "Partner School Academy",
    timings: "Morning & Evening batches",
    contact: "+91-9876543210",
    embedLink: "https://www.google.com/maps/embed?pb=..."
  },
  {
    id: 3,
    name: "Mohan Garden Branch",
    address: "Mohan Garden, Delhi",
    type: "Dedicated Training Center",
    timings: "Flexible batches",
    contact: "+91-9876543210",
    embedLink: "https://www.google.com/maps/embed?pb=..."
  },
  {
    id: 4,
    name: "Dwarka Branch",
    address: "Dwarka, Delhi",
    type: "Dedicated Training Center",
    timings: "Morning & Evening batches",
    contact: "+91-9876543210",
    embedLink: "https://www.google.com/maps/embed?pb=..."
  }
];

export const COACHES = [
  {
    name: "Akash",
    role: "Coach",
    specialization: "Speed",
    experience: "16 years",
    achievements: [
      "Guinness World Record Holder",
      "Limca Book Record Holder",
      "50+ National Medals",
      "Silver Medal - Delhi Olympics"
    ],
    bio: "I wanted to share not just my achievements, but also the skills, knowledge, and motivation I've gained over the years."
  },
  {
    name: "Amit Pal",
    role: "Highest Record Holder",
    specialization: "Speed",
    experience: "11 years",
    achievements: [
      "3 Guinness World Records",
      "4 Limca Book Records",
      "10 National Medals",
      "India Book of Records Holder"
    ],
    bio: "Rope skipping has become more than just Sport; it transformed into a form of artistic expression and meditation."
  },
  {
    name: "Priyanka Rajput",
    role: "Coach",
    specialization: "Double Dutch",
    experience: "11 years",
    achievements: [
      "Limca Book Record Holder",
      "15+ National Medals",
      "Delhi Olympic Medal",
      "80+ Total Medals"
    ],
    bio: "I joined as a student and all time I win only gold medals of my 7 years of student journey."
  },
  {
    name: "Srijan Kumar",
    role: "Trainer",
    specialization: "Double Dutch",
    experience: "10 years",
    achievements: [
      "3rd Place in Double Dutch Contest World, Tokyo, Japan 2019",
      "7 Gold, 2 Silver, 2 Bronze (National level)",
      "2 Gold (Delhi Olympics)"
    ],
    bio: "International competitor bringing global standards to the academy."
  },
  {
    name: "Ravina",
    role: "Coach",
    specialization: "Double Dutch",
    experience: "5 years",
    achievements: [
      "6 National Medals",
      "2 Delhi Olympic Medals",
      "Gold in all three events at SGFI 2017"
    ],
    bio: "Rope Pro Academy helped me grow with expert guidance, discipline, and motivation."
  },
  {
    name: "Tarunya Jain",
    role: "Trainer",
    specialization: "Double Dutch",
    experience: "9 years",
    achievements: [
      "19 National Medals",
      "Gold Medal - Delhi Olympics",
      "International level bronze medalist"
    ],
    bio: "Develop students coordination, endurance, and technique through structured training methods."
  }
];

export const MILESTONES = [
  { year: "2015", title: "Foundation", description: "Academy established by Mr. Ravi Paswan with a vision to create a structured platform for rope skipping in India." },
  { year: "2018", title: "First Guinness World Record", description: "Trained the first Guinness World Record holder. Global recognition achieved." },
  { year: "2019", title: "International Glory", description: "Srijan Kumar wins 3rd Place in Double Dutch Contest World, Tokyo. 50+ national medals won collectively." },
  { year: "2022", title: "Major Expansion", description: "Expanded to multiple partner locations across Delhi. 100+ students training regularly." },
  { year: "2023", title: "Championship Year", description: "Record national medals. 10 gold medals at CBSE Nationals. 3 international players in top 10 at World Championship." },
  { year: "2024", title: "Peak Excellence", description: "15+ professional coaches, 100+ national players, 7 Guinness World Records, 16 International Players." }
];

export const TESTIMONIALS_DATA = [
  {
    name: "Ravina",
    role: "Delhi Olympic",
    quote: "I joined Rope Pro Academy to learn different events in a proper and professional way. The academy has helped me grow with expert guidance, discipline, and motivation.",
    badge: "Gold Medalist",
    image: "/images/testimonials/ravina.jpg",
    rating: 5,
    subtext: "Representing India on the international stage was a dream come true, and Rope Pro Academy made it possible."
  },
  {
    name: "Aniket",
    role: "SGFI Gold Medalist",
    // TODO: replace with real content - quote for Aniket pending verified source from administration
    quote: "Training at Rope Pro Academy has transformed my speed, focus, and athletic discipline from day one.",
    badge: "Academy Athlete",
    image: "/images/testimonials/aniket.jpg",
    rating: 5,
    subtext: "Training with national champions pushed my limits and discipline."
  },
  {
    name: "Priyanka",
    role: "SGFI Gold Medalist",
    quote: "The rope skipping academy I attend is truly one of the best in India. The instructors pay attention to every child, not just the strongest ones.",
    badge: "National Medalist",
    image: "/images/testimonials/priyanka.jpg",
    rating: 5,
    subtext: "The dedicated attention from coaches transformed my technique and confidence."
  }
];

export const WHY_CHOOSE_US = [
  { title: "Founded by a Pioneer", description: "Mr. Ravi Paswan's vision and dedication to athlete excellence." },
  { title: "Proven Track Record", description: "7 Guinness Records, 100+ National Champions, 16 International Players." },
  { title: "Professional Coaching", description: "Experienced, passionate coaches dedicated to every student." },
  { title: "Structured Programs", description: "Age-appropriate classes from ages 5 to 40." },
  { title: "Safe & Supportive", description: "A safe, supportive environment with top-quality equipment." },
  { title: "Holistic Development", description: "Physical fitness, mental discipline, and competitive pathways." }
];
