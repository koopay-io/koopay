import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const remotePatterns = [];

if (supabaseHostname) {
  remotePatterns.push({
    protocol: 'https' as const,
    hostname: supabaseHostname,
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
