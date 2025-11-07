"use client";
// TODO! Fix typescript warning, not hide them

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { createEscrow, signTransactionWithSk } from "@/lib/stellar/trustless";
import { useSendTransaction } from "@trustless-work/escrow";
import { useContractGeneration } from "./useContractGeneration";

// Interface for data from the Create Project form
interface Milestone {
  title: string;
  description: string;
  percentage: number;
  deadline: string;
}

interface ProjectData {
  title: string;
  description: string;
  total_amount: number;
  expected_delivery_date: string;
  freelancer_id: string | null;
  milestones: Milestone[];
}

interface CreateProjectResult {
  success: boolean;
  project?: Record<string, unknown> & { id: string };
  contractId?: string;
  error?: string;
}

/**
 * Hook to create projects with simple, direct escrow deployment
 */
export const useProjectCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallet } = useStellarWallet(); // Wallet of the contractor (client)
  const { sendTransaction } = useSendTransaction(); // Use SDK hook instead of direct HTTP
  const { generateContract } = useContractGeneration(); // For generating contract PDF
  const supabase = createClient();

  const createProjectWithEscrow = async (
    data: ProjectData,
  ): Promise<CreateProjectResult> => {
    // Validation
    if (!wallet?.secretKey) {
      const errorMsg = "Contractor wallet not found. Please log in.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    if (!data.freelancer_id) {
      const errorMsg = "Please assign a freelancer to the project";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    // TODO! add milestone percentage validation here if needed

    setIsLoading(true);
    setError(null);

    try {
      // FOR TESTING: Use the contractor's own wallet as the freelancer
      // TODO! fetch the freelancer's public key from their profile.
      const collaboratorPublicKey = wallet.publicKey;

      // Call API to get unsigned transaction
      const escrowResult = await createEscrow(
        wallet,
        data,
        collaboratorPublicKey,
      );
      const unsignedTx = escrowResult.unsignedTransaction;

      if (!unsignedTx) {
        throw new Error(
          "API did not return an unsigned transaction or contractId",
        );
      }

      // Sign the transaction
      const signedTxXdr = signTransactionWithSk(unsignedTx, wallet.secretKey!);

      // Submit the transaction using SDK hook (returns InitializeMultiReleaseEscrowResponse with contractId)
      const txResponse = await sendTransaction(signedTxXdr);

      // The SDK's sendTransaction can return different types:
      // - SendTransactionResponse: { status, message } (no contractId)
      // - InitializeMultiReleaseEscrowResponse: { status, message, contractId, escrow }
      let contractId: string | null = null;
      
      // Check if response has contractId (it's an InitializeMultiReleaseEscrowResponse)
      if ('contractId' in txResponse && typeof txResponse.contractId === 'string') {
        contractId = txResponse.contractId;
      } else if ('escrow' in txResponse && typeof txResponse.escrow === 'object' && txResponse.escrow !== null) {
        // Try to get contractId from escrow object
        const escrow = txResponse.escrow as { contractId?: string };
        if (escrow.contractId) {
          contractId = escrow.contractId;
        }
      }
      
      if (!contractId) {
        console.error("❌ No contractId found in response:", txResponse);
        throw new Error("No contractId returned from escrow deployment. Response: " + JSON.stringify(txResponse));
      }

      // Save project to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // @ts-ignore
      const { data: project, error: projectError } = await supabase
        .from("projects")
        // @ts-ignore - This is line 109
        .insert({
          contractor_id: user.id,
          freelancer_id: data.freelancer_id,
          title: data.title,
          description: data.description,
          total_amount: data.total_amount,
          expected_delivery_date: data.expected_delivery_date,
          status: "active",
          contract_id: contractId, // Save the escrow contract ID
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Save milestones to Supabase with explicit created_at timestamps to preserve order
      // Each milestone gets a timestamp that respects the array order
      // This ensures the order in DB matches the order in escrow (index 0, 1, 2...)
      const baseTime = Date.now();
      const milestonesToInsert = data.milestones.map((milestone, index) => {
        // Create timestamp with incremental seconds to preserve order
        // First milestone (index 0) gets base time, each subsequent gets +index seconds
        // This ensures proper ordering even if inserted in batch
        const milestoneTimestamp = new Date(baseTime + (index * 1000)).toISOString();
        return {
          // @ts-ignore
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          percentage: milestone.percentage,
          // deadline: milestone.deadline, // TODO! Add milestone deadline to supabase
          status: "pending",
          created_at: milestoneTimestamp, // Explicit timestamp to preserve order
        };
      });

      const { error: milestonesError } = await supabase
        .from("milestones")
        // @ts-ignore
        .insert(milestonesToInsert);

      if (milestonesError) throw milestonesError;

      // Generate and save contract PDF (invoice)
      try {
        // Fetch contractor and freelancer profiles
        const { data: contractorProfile } = await supabase
          .from("contractor_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: freelancerProfile } = await supabase
          .from("freelancer_profiles")
          .select("*")
          .eq("id", data.freelancer_id)
          .single();

        // Get user email from profiles table
        const { data: contractorProfileData } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        const { data: freelancerProfileData } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", data.freelancer_id)
          .single();

        if (contractorProfile && freelancerProfile) {
          const contractorProfileTyped = contractorProfile as {
            full_name?: string;
            legal_name?: string;
            display_name?: string;
            individual_id?: string;
            business_id?: string;
            country?: string;
            address?: string;
          };

          const freelancerProfileTyped = freelancerProfile as {
            full_name?: string;
            freelancer_id?: string;
            country?: string;
            address?: string;
          };

          const projectTyped = project as { id: string };

          const contractResult = await generateContract(
            {
              fullName: contractorProfileTyped.full_name || undefined,
              legalName: contractorProfileTyped.legal_name || undefined,
              displayName: contractorProfileTyped.display_name || undefined,
              individualId: contractorProfileTyped.individual_id || undefined,
              businessId: contractorProfileTyped.business_id || undefined,
              country: contractorProfileTyped.country || "Unknown",
              address: contractorProfileTyped.address || "Unknown",
              email: (contractorProfileData as { email?: string } | null)?.email || user.email || "",
            },
            {
              fullName: freelancerProfileTyped.full_name || "Unknown",
              freelancerId: freelancerProfileTyped.freelancer_id || "Unknown",
              country: freelancerProfileTyped.country || "Unknown",
              address: freelancerProfileTyped.address || "Unknown",
              email: (freelancerProfileData as { email?: string } | null)?.email || "",
            },
            {
              id: projectTyped.id,
              title: data.title,
              description: data.description,
              totalAmount: data.total_amount,
              expectedDeliveryDate: data.expected_delivery_date,
              milestones: data.milestones.map((m) => ({
                title: m.title,
                description: m.description,
                percentage: m.percentage,
              })),
            }
          );

          if (contractResult.success && contractResult.contractUrl) {
            // Update project with contract URL
            await supabase
              .from("projects")
              .update({ contract_url: contractResult.contractUrl } as never)
              .eq("id", projectTyped.id);
          }
        }
      } catch (contractError) {
        // Don't fail project creation if contract generation fails
        console.error("⚠️ Failed to generate contract PDF:", contractError);
      }

      setIsLoading(false);
      return { success: true, project, contractId };
    } catch (err: unknown) {
      console.error("❌ Error creating project:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create project";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return { createProjectWithEscrow, isLoading, error };
};
