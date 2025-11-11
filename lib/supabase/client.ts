import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types/database.gen";
import { SUPABASE_PUBLISHABLE_OR_ANON_KEY, SUPABASE_URL } from "../constants";

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses Database type from database.gen.ts which includes all tables from your DB.
 *
 * @returns Supabase client with full type safety for all database tables
 */
export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_OR_ANON_KEY,
  );
}
