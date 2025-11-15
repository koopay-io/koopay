"use client";

import React from "react";
import { development, TrustlessWorkConfig } from "@trustless-work/escrow";

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export const TrustlessWorkProvider: React.FC<TrustlessWorkProviderProps> = ({
  children,
}) => {
  // Access environment variable directly in client component
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  // Validate API key is configured
  if (!apiKey && typeof window !== "undefined") {
    console.error("❌ NEXT_PUBLIC_API_KEY is not configured in .env.local");
  }

  return (
    <TrustlessWorkConfig baseURL={development} apiKey={apiKey || ""}>
      {children}
    </TrustlessWorkConfig>
  );
};
