import { ReactNode } from 'react';
import { OnboardingProvider } from '@/lib/contexts/OnboardingContext';
import { createClient } from '@/lib/supabase/server';
import { TCountryRow } from '@/lib/validations/countries';

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const [countriesResult, userResult] = await Promise.all([
    supabase
      .from('countries')
      .select('*')
      .eq('available', true)
      .order('name', { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const countries: TCountryRow[] = countriesResult.data || [];
  const user = userResult.data?.user || null;

  return (
    <OnboardingProvider countries={countries} user={user}>
      {children}
    </OnboardingProvider>
  );
}
