"use server";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/constants";

/**
 * Retrieves the Stellar wallet public key for a given user ID using the service role key.
 * This is necessary because user_metadata for other users is not accessible via RLS on the client.
 */
export async function getUserStellarWallet(userId: string): Promise<string | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not defined");
    return null;
  }

  try {
    // Create a Supabase admin client for this request
    const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      console.error(`Error fetching user ${userId}:`, error.message);
      return null;
    }

    if (!user) {
      console.warn(`User ${userId} not found`);
      return null;
    }

    // Extract wallet from user metadata
    const walletData = user.user_metadata?.stellar_wallet;

    if (!walletData?.publicKey) {
      console.warn(`User ${userId} has no Stellar wallet`);
      return null;
    }

    return walletData.publicKey;
  } catch (err) {
    console.error("Unexpected error in getUserStellarWallet:", err);
    return null;
  }
}
