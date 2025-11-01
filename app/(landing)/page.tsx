import { Navigation } from '@/app/(landing)/_components/navigation';
import { HeroSection } from '@/app/(landing)/_components/hero-section';
import { ProblemSection } from '@/app/(landing)/_components/problem-section';
import { SolutionSection } from '@/app/(landing)/_components/solution-section';
import { HowItWorksSection } from '@/app/(landing)/_components/how-it-works';
import { TeamSection } from '@/app/(landing)/_components/team-section';
import { VisionSection } from '@/app/(landing)/_components/vision-section';
import { CTASection } from '@/app/(landing)/_components/cta-section';
import { Footer } from '@/app/(landing)/_components/footer';
import { BackgroundAurora } from '@/app/(landing)/_components/background-aurora';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
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
