"use client";
// TODO! Fix typescript warning, not hide them

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { createEscrow, signTransactionWithSk } from "@/lib/stellar/trustless";
import { http } from "@/lib/stellar/http";

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
  project?: any; // Define this type based on your Supabase table
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
      console.log(
        "Using contractor's wallet as freelancer for testing:",
        collaboratorPublicKey,
      );

      // Call API to get unsigned transaction
      console.log("Step 1: Calling createEscrow API...");
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
      console.log("Step 1 Complete: Got XDR");

      // Sign the transaction
      console.log("Step 2: Signing transaction...");
      const signedTxXdr = signTransactionWithSk(unsignedTx, wallet.secretKey!);
      console.log("Step 2 Complete: Transaction signed.");

      // Submit the transaction
      console.log("Step 3: Submitting to network...");
      const tx = await http.post("/helper/send-transaction", {
        signedXdr: signedTxXdr,
      });
      console.log("Step 3 Complete: Transaction submitted.", tx.data);

      const contractId = tx.data.contract_id;

      // Save project to Supabase
      console.log("Step 4: Saving project to Supabase...");
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
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Save milestones to Supabase
      console.log("Step 5: Saving milestones to Supabase...");
      const milestonesToInsert = data.milestones.map((milestone) => ({
        // @ts-ignore
        project_id: project.id,
        title: milestone.title,
        description: milestone.description,
        percentage: milestone.percentage,
        // deadline: milestone.deadline, // TODO! Add milestone deadline to supabase
        status: "pending",
      }));

      const { error: milestonesError } = await supabase
        .from("milestones")
        // @ts-ignore
        .insert(milestonesToInsert);

      if (milestonesError) throw milestonesError;

      console.log("✅ Project created successfully!");
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
