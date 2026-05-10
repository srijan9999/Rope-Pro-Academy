import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ConditionalFooter } from "@/components/conditional-footer";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Rope Pro Academy | India's Premier Rope Skipping Academy - 7× World Record Holders",
  description: "Join Rope Pro Academy, home to 7 Guinness World Record holders. Master rope skipping with 15+ expert coaches across 4 locations in India. Enroll now!",
  keywords: "rope skipping, jump rope, rope pro academy, world record, fitness, india, rope skipping classes, jump rope training",
  openGraph: {
    title: "Rope Pro Academy - Master the Art of Rope Skipping",
    description: "Train with world champions at India's #1 rope skipping academy. 7 Guinness World Records, 300+ students, 15+ expert coaches.",
    url: "https://ropeproacademy.com",
    siteName: "Rope Pro Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rope Pro Academy",
    description: "India's Premier Rope Skipping Academy - 7× Guinness World Record Holders",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${oswald.variable} antialiased font-sans min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
