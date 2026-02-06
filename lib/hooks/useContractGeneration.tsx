"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { pdf } from "@react-pdf/renderer";
import { ContractPDF } from "@/components/projects/ContractPdf";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

interface ContractorData {
  fullName?: string;
  legalName?: string;
  displayName?: string;
  individualId?: string;
  businessId?: string;
  country: string;
  address: string;
  email: string;
}

interface FreelancerData {
  fullName: string;
  freelancerId: string;
  country: string;
  address: string;
  email: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  expectedDeliveryDate: string;
  milestones: Array<{
    title: string;
    description: string;
    percentage: number;
  }>;
}

export function useContractGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { showError, showSuccess, showNetworkError, showAPIError } =
    useErrorToast();

  const generateContract = async (
    contractor: ContractorData,
    freelancer: FreelancerData,
    project: ProjectData,
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log("Generating contract PDF...");

      // Generate unique contract ID
      const contractId = `CONTRACT-${project.id}-${Date.now()}`;

      // Create PDF blob
      const pdfBlob = await pdf(
        <ContractPDF
          contractor={contractor}
          freelancer={freelancer}
          project={project}
          contractId={contractId}
        />,
      ).toBlob();

      console.log("PDF generated, uploading to storage...");
      console.log("PDF blob size:", pdfBlob.size, "bytes");

      // Get current user ID for folder structure
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error("Authentication failed. Please sign in again.");
      }

      if (!user) {
        throw new Error("You must be signed in to generate contracts.");
      }

      const userId = user.id;
      const bucketName = "contracts";
      const fileName = `${userId}/${contractId}.pdf`;

      console.log(`Uploading to contracts bucket with path: ${fileName}`);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // Handle specific upload errors
        if (uploadError.message.includes("not found")) {
          throw new Error(
            "Contracts storage bucket not found. Please contact support.",
          );
        }
        if (uploadError.message.includes("permission")) {
          throw new Error(
            "You don't have permission to upload contracts. Please contact support.",
          );
        }

        throw new Error(`Failed to upload contract: ${uploadError.message}`);
      }

      console.log(`File uploaded successfully to ${bucketName} bucket`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log("Contract uploaded successfully:", urlData.publicUrl);

      // Open PDF in new tab
      if (typeof window !== "undefined") {
        window.open(urlData.publicUrl, "_blank");
        console.log("PDF opened in new tab");
      }

      showSuccess(
        "Contract Generated",
        `Contract ${contractId} created successfully`,
      );

      return {
        success: true,
        contractId,
        contractUrl: urlData.publicUrl,
        fileName,
        bucketName,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      logError(error, "Generate Contract");

      if (isNetworkError(error)) {
        showNetworkError(() =>
          generateContract(contractor, freelancer, project),
        );
      } else if (
        error instanceof Error &&
        error.message.includes("Authentication")
      ) {
        showAPIError(error, "Authentication Error");
      } else {
        showError(error, "Failed to Generate Contract");
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContract,
    isGenerating,
    error,
  };
}
