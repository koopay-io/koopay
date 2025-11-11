"use client";

import React from "react";
import { development, TrustlessWorkConfig } from "@trustless-work/escrow";
import { TRUSTLESS_API_KEY } from "@/lib/constants";

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export const TrustlessWorkProvider: React.FC<TrustlessWorkProviderProps> = ({
  children,
}) => {
  const apiKey = TRUSTLESS_API_KEY;
  console.log(apiKey);

  // Validate API key is configured
  if (!apiKey && typeof window !== "undefined") {
    console.error("❌ NEXT_PUBLIC_API_KEY is not configured in .env.local");
  }

  return (
    <TrustlessWorkConfig baseURL={development} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
};
