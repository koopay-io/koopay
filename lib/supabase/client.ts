import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types/database.gen';

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses Database type from database.gen.ts which includes all tables from your DB.
 * 
 * @returns Supabase client with full type safety for all database tables
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
}
