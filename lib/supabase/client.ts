import { createBrowserClient } from '@supabase/ssr';
import { IDatabase } from './types';

export function createClient() {
  return createBrowserClient<IDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
}
