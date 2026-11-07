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
  title: "Rope Pro Academy | Train like a Pro, Perform like a Champion",
  description: "Join Rope Pro Academy. Train like a Pro, Perform like a Champion with expert coaches, 7× Guinness World Record holders, and international champions. Enroll now!",
  keywords: "rope skipping, jump rope, rope pro academy, world record, fitness, india, rope skipping classes, jump rope training",
  openGraph: {
    title: "Rope Pro Academy - Train like a Pro, Perform like a Champion",
    description: "Train like a Pro, Perform like a Champion at India's premier rope skipping academy with 1000+ students trained and 16 international players.",
    url: "https://ropeproacademy.com",
    siteName: "Rope Pro Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rope Pro Academy | Train like a Pro, Perform like a Champion",
    description: "Train like a Pro, Perform like a Champion at Rope Pro Academy - India's Premier Rope Skipping Academy",
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
