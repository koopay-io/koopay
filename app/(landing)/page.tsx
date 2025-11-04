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
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasUser = false;
  let hasOrganization = false;

  if (user) {
    hasUser = true;
    const { data: userOrganization } = await supabase
      .from('user_organization')
      .select('*')
      .eq('user_id', user.id)
      .single();

    hasOrganization = !!userOrganization;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundAurora />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(125,211,252,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_rgba(167,139,250,0.15),transparent_55%)]" />
      <Navigation hasUser={hasUser} hasOrganization={hasOrganization} />
      <HeroSection hasUser={hasUser} hasOrganization={hasOrganization} />
      <ProblemSection />
      <SolutionSection hasUser={hasUser} hasOrganization={hasOrganization} />
      <HowItWorksSection hasUser={hasUser} hasOrganization={hasOrganization} />
      <TeamSection />
      <VisionSection hasUser={hasUser} hasOrganization={hasOrganization} />
      <CTASection />
      <Footer />
    </main>
  );
}
