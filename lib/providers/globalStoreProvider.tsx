'use client';

import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { TOrganizationRow } from '@/lib/validations/organizations';
import { useGlobalStore } from '@/lib/stores/globalStore';

interface GlobalStoreProviderProps {
  children: React.ReactNode;
  initialState: {
    user: User;
    organizations: TOrganizationRow[];
  };
}

export function GlobalStoreProvider({
  children,
  initialState,
}: GlobalStoreProviderProps) {
  const { user, organizations, setUser, setOrganizations } = useGlobalStore();

  useEffect(() => {
    if (!user || organizations.length === 0) {
      setUser(initialState.user);
      setOrganizations(initialState.organizations);
    }
  }, [user, organizations.length, initialState.user, initialState.organizations, setUser, setOrganizations]);

  return <>{children}</>;
}

