import { Navigation } from '@/app/(landing)/_components/Navigation';
import { HeroSection } from '@/app/(landing)/_components/HeroSection';
import { ProblemSection } from '@/app/(landing)/_components/ProblemSection';
import { SolutionSection } from '@/app/(landing)/_components/SolutionSection';
import { HowItWorksSection } from '@/app/(landing)/_components/HowItWorks';
import { VisionSection } from '@/app/(landing)/_components/VisionSection';
import { CTASection } from '@/app/(landing)/_components/CTASection';
import { Footer } from '@/app/(landing)/_components/Footer';
import { BackgroundAurora } from '@/app/(landing)/_components/BackgroundAurora';
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
      .is('deleted_at', null)
      .is('deleted_by', null)
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
      <VisionSection hasUser={hasUser} hasOrganization={hasOrganization} />
      <CTASection />
      <Footer />
    </main>
  );
}
