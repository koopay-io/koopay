"use client";
// TODO! Fix typescript warning, not hide them

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { createEscrow, signTransactionWithSk } from "@/lib/stellar/trustless";
import { useSendTransaction } from "@trustless-work/escrow";
import { useContractGeneration } from "./useContractGeneration";
import { getUserStellarWallet } from "@/lib/actions/wallet";

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
      // Fetch the freelancer's public key from their profile
      const freelancerWallet = await getUserStellarWallet(data.freelancer_id);

      if (!freelancerWallet) {
        throw new Error("Freelancer wallet not found. Please ensure freelancer has completed onboarding.");
      }

      const collaboratorPublicKey = freelancerWallet;

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
      if (
        "contractId" in txResponse &&
        typeof txResponse.contractId === "string"
      ) {
        contractId = txResponse.contractId;
      } else if (
        "escrow" in txResponse &&
        typeof txResponse.escrow === "object" &&
        txResponse.escrow !== null
      ) {
        // Try to get contractId from escrow object
        const escrow = txResponse.escrow as { contractId?: string };
        if (escrow.contractId) {
          contractId = escrow.contractId;
        }
      }

      if (!contractId) {
        console.error("❌ No contractId found in response:", txResponse);
        throw new Error(
          "No contractId returned from escrow deployment. Response: " +
            JSON.stringify(txResponse),
        );
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
        const milestoneTimestamp = new Date(
          baseTime + index * 1000,
        ).toISOString();
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
        // 1. Fetch Contractor Organization (The User creating the project)
        const { data: contractorOrgData } = await supabase
          .from("organizations")
          .select("*, user_organization!inner(user_id, email)")
          .eq("user_organization.user_id", user.id)
          .limit(1)
          .single();

        // 2. Fetch Freelancer Organization (The User assigned)
        const { data: freelancerOrgData } = await supabase
          .from("organizations")
          .select("*, user_organization!inner(user_id, email)")
          .eq("user_organization.user_id", data.freelancer_id)
          .limit(1)
          .single();

        // 3. Get emails
        const { data: contractorAuth } = await supabase.auth.getUser(); // Already have this as 'user'

        // We need to fetch freelancer email specifically if not available in org
        // Note: We can't easily get another user's email from auth.users via client SDK for privacy
        // We will use the email stored in user_organization if available, or a placeholder
        const freelancerEmail =
          freelancerOrgData?.user_organization?.[0]?.email || "";

        if (contractorOrgData && freelancerOrgData) {
          // Prepare names
          const contractorName =
            contractorOrgData.legal_type === "individual"
              ? contractorOrgData.legal_name
              : contractorOrgData.name;

          const freelancerName =
            freelancerOrgData.legal_type === "individual"
              ? freelancerOrgData.legal_name
              : freelancerOrgData.name;

          // Prepare addresses
          const contractorAddr = [
            contractorOrgData.legal_street_name,
            contractorOrgData.legal_street_number,
            contractorOrgData.legal_city,
            contractorOrgData.legal_country_id,
          ]
            .filter(Boolean)
            .join(", ");

          const freelancerAddr = [
            freelancerOrgData.legal_street_name,
            freelancerOrgData.legal_street_number,
            freelancerOrgData.legal_city,
            freelancerOrgData.legal_country_id,
          ]
            .filter(Boolean)
            .join(", ");

          const contractResult = await generateContract(
            {
              fullName: contractorName,
              legalName: contractorOrgData.legal_name,
              displayName: contractorOrgData.name,
              individualId: contractorOrgData.legal_id,
              businessId: contractorOrgData.legal_id,
              country: String(contractorOrgData.legal_country_id || "Unknown"),
              address: contractorAddr,
              email: user.email || "",
            },
            {
              fullName: freelancerName,
              freelancerId: freelancerOrgData.legal_id,
              country: String(freelancerOrgData.legal_country_id || "Unknown"),
              address: freelancerAddr,
              email: freelancerEmail,
            },
            {
              // @ts-ignore
              id: project.id,
              title: data.title,
              description: data.description,
              totalAmount: data.total_amount,
              expectedDeliveryDate: data.expected_delivery_date,
              milestones: data.milestones.map((m) => ({
                title: m.title,
                description: m.description,
                percentage: m.percentage,
              })),
            },
          );

          if (contractResult.success && contractResult.contractUrl) {
            await supabase
              .from("projects")
              // @ts-ignore
              .update({ contract_url: contractResult.contractUrl })
              .eq("id", project.id);
          }
        }
      } catch (contractError) {
        console.error("⚠️ Failed to generate contract PDF:", contractError);
      }

      setIsLoading(false);
      return {
        success: true,
        project,
        contractId,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setIsLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return { createProjectWithEscrow, isLoading, error };
};
