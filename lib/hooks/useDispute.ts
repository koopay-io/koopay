"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMilestoneEvidence } from "./useMilestoneEvidence";
import { useEscrowWithSecretKey } from "./useEscrowWithSecretKey";
import { useStellarWallet } from "./useStellarWallet";
import type { MultiReleaseStartDisputePayload } from "@trustless-work/escrow/types";

interface OpenDisputeParams {
  projectId: string;
  milestoneId: string;
  contractId: string;
  milestoneIndex: number;
  reason: string;
  comments?: string;
  files: File[];
}

interface OpenDisputeResult {
  success: boolean;
  error?: string;
}

export const useDispute = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { uploadEvidence } = useMilestoneEvidence();
  const { startDisputeInEscrow } = useEscrowWithSecretKey();
  const { wallet } = useStellarWallet();

  const openDispute = async (params: OpenDisputeParams): Promise<OpenDisputeResult> => {
    const { projectId, milestoneId, contractId, milestoneIndex, reason, comments, files } = params;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1) Ensure user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 2) Upload evidence (enforce at least one file)
      if (!files || files.length === 0) {
        throw new Error("Please attach at least one evidence file.");
      }
      for (const file of files) {
        const res = await uploadEvidence(milestoneId, file, reason);
        if (!res.success) throw new Error(res.error || "Failed to upload evidence");
      }

      // 3) Record dispute locally (minimal; future migration can enrich schema)
      // Using disputes table (base columns only); save extra info into a JSON metadata column
      // when available; here we just create a row to track the action.
      await supabase.from("disputes").insert({} as never);

      // 4) Start dispute on-chain using Trustless Work
      if (!wallet?.publicKey || !wallet?.secretKey) {
        throw new Error("Wallet not available");
      }

      const payload: MultiReleaseStartDisputePayload = {
        contractId,
        milestoneIndex: String(milestoneIndex),
        signer: wallet.publicKey,
      };

      await startDisputeInEscrow(payload, wallet.secretKey);

      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to open dispute";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    openDispute,
  };
};


