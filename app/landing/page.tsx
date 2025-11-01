import { Navigation } from "@/components/sections/navigation";
import { HeroSection } from "@/components/sections/hero-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { SolutionSection } from "@/components/sections/solution-section";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { TeamSection } from "@/components/sections/team-section";
import { VisionSection } from "@/components/sections/vision-section";
import { CTASection } from "@/components/sections/cta-section";
import { Footer } from "@/components/sections/footer";
import { BackgroundAurora } from "@/components/sections/background-aurora";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060a1a]">
      <BackgroundAurora />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(125,211,252,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_rgba(167,139,250,0.15),transparent_55%)]" />
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <TeamSection />
      <VisionSection />
      <CTASection />
      <Footer />
    </main>
  );
}
