"use client";
// TODO! Fix typescript warning, not hide them

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { createEscrow, signTransactionWithSk } from "@/lib/stellar/trustless";
import { http } from "@/lib/stellar/http";
import { pdf } from "@react-pdf/renderer";
import { ContractPDF } from "@/components/contract-pdf";

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

      // Step 6: Generate and upload contract
      console.log("Step 6: Generating and uploading contract...");
      try {
        // Fetch contractor profile data
        const { data: contractorProfile, error: contractorError } = await supabase
          .from("freelancer_profiles")
          .select("full_name, country, address, email")
          .eq("id", user.id)
          .single() as { 
            data: { full_name: string; country: string; address: string; email: string } | null; 
            error: any 
          };

        // Fetch freelancer profile data
        const { data: freelancerProfile, error: freelancerError } = await supabase
          .from("freelancer_profiles")
          .select("full_name, country, address, email")
          .eq("id", data.freelancer_id)
          .single() as { 
            data: { full_name: string; country: string; address: string; email: string } | null; 
            error: any 
          };

        if (contractorError || !contractorProfile) {
          console.error("Error fetching contractor profile:", contractorError);
          console.warn("⚠️ Contract generation skipped: contractor profile not found");
        } else if (freelancerError || !freelancerProfile) {
          console.error("Error fetching freelancer profile:", freelancerError);
          console.warn("⚠️ Contract generation skipped: freelancer profile not found");
        } else {
          // Generate unique contract ID
          // @ts-ignore
          const legalContractId = `CONTRACT-${project.id}-${Date.now()}`;

          // Prepare contract data
          const contractorData = {
            fullName: contractorProfile.full_name || "N/A",
            individualId: user.id,
            country: contractorProfile.country || "N/A",
            address: contractorProfile.address || "N/A",
            email: contractorProfile.email || user.email || "N/A",
          };

          const freelancerData = {
            fullName: freelancerProfile.full_name || "N/A",
            freelancerId: data.freelancer_id || "N/A",
            country: freelancerProfile.country || "N/A",
            address: freelancerProfile.address || "N/A",
            email: freelancerProfile.email || "N/A",
          };

          const projectData = {
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
          };

          // Generate PDF blob
          const pdfBlob = await pdf(
            <ContractPDF
              contractor={contractorData}
              freelancer={freelancerData}
              project={projectData}
              contractId={legalContractId}
            />
          ).toBlob();

          console.log("PDF generated, uploading to storage...");
          console.log("PDF blob size:", pdfBlob.size, "bytes");

          // Upload to Supabase storage
          const bucketName = "contracts";
          const fileName = `${user.id}/${legalContractId}.pdf`;

          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, pdfBlob, {
              contentType: "application/pdf",
              upsert: true,
            });

          if (uploadError) {
            console.error("Error uploading contract:", uploadError);
            console.warn("⚠️ Contract upload failed, continuing without contract URL");
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fileName);

            console.log("Contract uploaded successfully:", urlData.publicUrl);

            // Update project with contract URL
            // @ts-ignore - Supabase type inference issue
            const { error: updateError } = await supabase
              .from("projects")
              // @ts-ignore - Supabase type inference issue
              .update({ contract_url: urlData.publicUrl })
              // @ts-ignore - Supabase type inference issue
              .eq("id", project.id);

            if (updateError) {
              console.error("Error updating project with contract URL:", updateError);
              console.warn("⚠️ Failed to link contract to project");
            } else {
              console.log("✅ Contract linked to project successfully");
            }
          }
        }
      } catch (contractError) {
        console.error("Error during contract generation:", contractError);
        console.warn("⚠️ Contract generation failed, continuing without contract");
        // Don't throw - we want the project to be created even if contract fails
      }

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
