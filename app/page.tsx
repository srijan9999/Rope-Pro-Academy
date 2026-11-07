import { HeroSection } from "@/components/home/hero-section";
import { ImpactStats } from "@/components/home/ImpactStats";
import { MissionVisionSection } from "@/components/home/mission-vision";
import { WhyChooseSection } from "@/components/home/why-choose";
import { KeyAchievements } from "@/components/home/achievements";
import { LocationsSection } from "@/components/home/locations-section";
import { CoachesPreview } from "@/components/home/coaches-preview";
import { TestimonialsSection } from "@/components/home/testimonials";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { CTASection } from "@/components/home/cta-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ImpactStats />
      <MissionVisionSection />
      <WhyChooseSection />
      <KeyAchievements />
      <LocationsSection />
      <CoachesPreview />
      <TestimonialsSection />
      <GalleryPreview />
      <CTASection />
    </div>
  );
}
