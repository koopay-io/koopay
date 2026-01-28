import { Metadata } from 'next';
import { Navigation } from '@/app/(landing)/_components/Navigation';
import { Footer } from '@/app/(landing)/_components/Footer';
import { BackgroundAurora } from '@/app/(landing)/_components/BackgroundAurora';
import { BrandKitSection } from '@/app/(landing)/brand-kit/_components/BrandKitSection';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Brand Kit | Koopay',
  description: 'Download Koopay brand assets including logos, wordmarks, and brand guidelines for developers, designers, and partners.',
  openGraph: {
    title: 'Brand Kit | Koopay',
    description: 'Download Koopay brand assets including logos, wordmarks, and brand guidelines for developers, designers, and partners.',
    type: 'website',
  },
};

export default async function BrandKitPage() {
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
      <BrandKitSection />
      <Footer />
    </main>
  );
}