"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { pdf } from "@react-pdf/renderer";
import { ContractPDF } from "@/components/ContractPdf";

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

  const generateContract = async (
    contractor: ContractorData,
    freelancer: FreelancerData,
    project: ProjectData
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
        />
      ).toBlob();

      console.log("PDF generated, uploading to storage...");
      console.log("PDF blob size:", pdfBlob.size, "bytes");

      // Get current user ID for folder structure
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const userId = user.id;
      const bucketName = "contracts";

      // Create folder structure: contracts/[userId]/[contractId].pdf
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
        throw new Error(`Error uploading contract: ${uploadError.message}`);
      }

      console.log(`File uploaded successfully to ${bucketName} bucket`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log("Contract uploaded successfully:", urlData.publicUrl);

      // Open PDF in new tab for testing
      if (typeof window !== "undefined") {
        window.open(urlData.publicUrl, "_blank");
        console.log("PDF opened in new tab");
      }

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
      console.error("Error generating contract:", error);
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
