import { HeroSection } from "@/components/home/hero-section";
import { StatsBanner } from "@/components/home/stats-banner";
import { KeyAchievements } from "@/components/home/achievements";
import { ProgramsGrid } from "@/components/home/programs-grid";
import { LocationsSection } from "@/components/home/locations-section";
import { CoachesPreview } from "@/components/home/coaches-preview";
import { TestimonialsSection } from "@/components/home/testimonials";
import { CTASection } from "@/components/home/cta-section";

import { GalleryPreview } from "@/components/home/gallery-preview";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <StatsBanner />
      <KeyAchievements />
      <ProgramsGrid />
      <LocationsSection />
      <CoachesPreview />
      <TestimonialsSection />
      <GalleryPreview />
      <CTASection />
    </div>
  );
}
