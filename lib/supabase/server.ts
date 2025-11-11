import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./types/database.gen";
import { SUPABASE_PUBLISHABLE_OR_ANON_KEY, SUPABASE_URL } from "../constants";

/**
 * Creates a Supabase client for server-side usage (Server Components, Server Actions).
 * Uses Database type from database.gen.ts which includes all tables from your DB.
 *
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using it.
 *
 * @returns Supabase client with full type safety for all database tables
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
