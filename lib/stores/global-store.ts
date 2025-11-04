import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { TOrganizationRow } from '@/lib/supabase/types/domain/organizations';

interface GlobalState {
  user: User | null;
  organizations: TOrganizationRow[];
  currentOrganization: TOrganizationRow | null;
  setUser: (user: User | null) => void;
  setOrganizations: (organizations: TOrganizationRow[]) => void;
  setCurrentOrganization: (organization: TOrganizationRow | null) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
  organizations: [],
  currentOrganization: null,
  setUser: (user) => set({ user }),
  setOrganizations: (organizations) => set({ organizations, currentOrganization: organizations[0] || null }),
  setCurrentOrganization: (organization) => set({ currentOrganization: organization }),
}));

