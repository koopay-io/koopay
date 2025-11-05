import { createClient } from '@/lib/supabase/server';
import { TrustlessWorkProvider } from '@/components/providers/TrustlessWorkProvider';
import { GlobalStoreProvider } from '@/lib/providers/global-store-provider';
import { DashboardNavbar } from './_components/dashboard-navbar';
import { Breadcrumb } from './_components/Breadcrumb';
import { redirect } from 'next/navigation';
import {
  TGetUserOrganizationsResponse,
  TGetUserOrganizationsParams,
} from '@/lib/supabase/types/functions/get_user_organizations';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const rpcResult = (await (
    supabase.rpc as unknown as (
      name: string,
      params: TGetUserOrganizationsParams
    ) => Promise<{ data: TGetUserOrganizationsResponse | null; error: Error | null }>
  )('get_user_organizations', { p_user_id: user.id } as TGetUserOrganizationsParams)) as {
    data: TGetUserOrganizationsResponse | null;
    error: Error | null;
  };
  const { data: organizationsData, error } = rpcResult;

  if (error) {
    throw new Error(`Error fetching organizations: ${error.message}`);
  }

  if (!organizationsData) {
    throw new Error('No organizations data returned');
  }

  const organizationsResponse = organizationsData;

  if (!organizationsResponse || organizationsResponse.total === 0) {
    redirect('/onboarding');
  }

  return (
    <TrustlessWorkProvider>
      <GlobalStoreProvider
        initialState={{
          user,
          organizations: organizationsResponse.organizations,
        }}
      >
        <div className="min-h-screen bg-background">
          <DashboardNavbar />
          <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <Breadcrumb />
            {children}
          </main>
        </div>
      </GlobalStoreProvider>
    </TrustlessWorkProvider>
  );
}
