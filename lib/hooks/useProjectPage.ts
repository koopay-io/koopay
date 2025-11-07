"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectMilestones } from "./useProjectMilestones";
import { getEscrowContractId } from "@/lib/utils/projectHelpers";
import { useStellarWallet } from "./useStellarWallet";
import { useEscrowWithSecretKey } from "./useEscrowWithSecretKey";
import { useEscrowDetails } from "./useEscrowDetails";
import type { ApproveMilestonePayload, ChangeMilestoneStatusPayload } from "@trustless-work/escrow/types";

/**
 * Custom hook to manage project page state and handlers
 */
export function useProjectPage(projectId: string) {
  const router = useRouter();
  const [milestoneCompleted, setMilestoneCompleted] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const {
    project,
    milestones,
    loading,
    fetchAllData,
    updateMilestoneStatus,
    getCurrentMilestone,
  } = useProjectMilestones(projectId);

  const { wallet } = useStellarWallet();
  const { approveMilestoneInEscrow, changeMilestoneStatusInEscrow } = useEscrowWithSecretKey();

  const currentMilestone = getCurrentMilestone();
  const escrowContractId = getEscrowContractId(project);
  const { escrowData } = useEscrowDetails(escrowContractId);
  
  // Get serviceProvider from escrow roles
  const serviceProvider = escrowData?.escrow?.roles && typeof escrowData.escrow.roles === 'object' && !Array.isArray(escrowData.escrow.roles)
    ? (escrowData.escrow.roles as { serviceProvider?: string }).serviceProvider
    : null;

  /**
   * Calculate the milestone index in the escrow based on matching
   * the milestone title/description with the escrow milestones
   */
  const getMilestoneIndex = (milestoneId: string): number => {
    // First, get the milestone from our database
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      console.warn("Milestone not found in database, defaulting to index 0");
      return 0;
    }

    // Get milestones from escrow (they should be in the correct order)
    const escrowMilestones = escrowData?.escrow?.milestones;
    if (!escrowMilestones || !Array.isArray(escrowMilestones)) {
      console.warn("Escrow milestones not available, using database order");
      // Fallback to database order (ascending to match creation order)
      const sortedMilestones = [...milestones].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB; // Ascending order (oldest first)
      });
      return sortedMilestones.findIndex((m) => m.id === milestoneId);
    }

    // Match milestone by description (escrow uses description field, which matches milestone title)
    const milestoneTitle = milestone.title;
    const index = escrowMilestones.findIndex((escrowMilestone: unknown) => {
      if (typeof escrowMilestone === 'object' && escrowMilestone !== null) {
        const escrowM = escrowMilestone as { description?: string };
        return escrowM.description === milestoneTitle;
      }
      return false;
    });

    if (index >= 0) {
      console.log(`✅ Found milestone "${milestoneTitle}" at escrow index ${index}`);
      return index;
    }

    console.warn(`⚠️ Milestone "${milestoneTitle}" not found in escrow, defaulting to index 0`);
    return 0;
  };

  const handleViewContract = () => {
    const contractUrl = project?.contract_url as string | undefined;
    if (contractUrl) {
      window.open(contractUrl, "_blank");
    } else if (escrowContractId) {
      router.push(`/projects/${projectId}/test-escrow`);
    } else {
      console.error("No contract URL or escrow contract ID found for this project");
      alert("No contract available for this project yet.");
    }
  };

  const handleMilestoneComplete = async () => {
    if (!currentMilestone) return;
    if (!escrowContractId) {
      setApprovalError("No escrow contract found for this project");
      return;
    }
    if (!wallet?.secretKey || !wallet?.publicKey) {
      setApprovalError("Wallet not available. Please ensure you're logged in.");
      return;
    }
    if (!serviceProvider) {
      setApprovalError("Service provider not found in escrow. Please wait for escrow data to load.");
      return;
    }

    setIsApproving(true);
    setApprovalError(null);

    try {
      // 1. Calculate milestone index in escrow
      const milestoneIndex = getMilestoneIndex(currentMilestone.id);
      
      // 2. Check if milestone is already approved in escrow
      const escrowMilestones = escrowData?.escrow?.milestones;
      if (escrowMilestones && Array.isArray(escrowMilestones) && escrowMilestones[milestoneIndex]) {
        const escrowMilestone = escrowMilestones[milestoneIndex] as { flags?: { approved?: boolean } };
        if (escrowMilestone.flags?.approved === true) {
          setApprovalError("Este milestone ya está aprobado en el smart contract");
          setIsApproving(false);
          return;
        }
      }
      
      // 3. Step 1: Approve milestone (sets flags.approved = true)
      const approvalPayload: ApproveMilestonePayload = {
        contractId: escrowContractId,
        milestoneIndex: milestoneIndex.toString(),
        approver: wallet.publicKey,
      };

      console.log("🔧 Step 1/2: Approving milestone in escrow:", {
        contractId: escrowContractId,
        milestoneIndex,
        milestoneTitle: currentMilestone.title,
      });

      const approvalResult = await approveMilestoneInEscrow(
        approvalPayload,
        wallet.secretKey
      );

      // Check if approval was successful
      if (approvalResult && typeof approvalResult === 'object') {
        const status = (approvalResult as { status?: string }).status;
        if (status === "ERROR") {
          const errorMsg = (approvalResult as { message?: string }).message || "Failed to approve milestone";
          throw new Error(errorMsg);
        }
      }

      console.log("✅ Step 1/2: Milestone approved (flag set)");

      // 3. Step 2: Change milestone status to "completed"
      // Note: This requires the serviceProvider's secret key, but in this case
      // since serviceProvider === approver (same wallet for testing), we use the same key
      const statusChangePayload: ChangeMilestoneStatusPayload = {
        contractId: escrowContractId,
        milestoneIndex: milestoneIndex.toString(),
        newStatus: "completed",
        serviceProvider: serviceProvider,
      };

      console.log("🔧 Step 2/2: Changing milestone status to 'completed':", {
        contractId: escrowContractId,
        milestoneIndex,
        newStatus: "completed",
      });

      const statusChangeResult = await changeMilestoneStatusInEscrow(
        statusChangePayload,
        wallet.secretKey // Using same wallet since serviceProvider === approver in test setup
      );

      // Check if status change was successful
      if (statusChangeResult && typeof statusChangeResult === 'object') {
        const status = (statusChangeResult as { status?: string }).status;
        if (status === "ERROR") {
          const errorMsg = (statusChangeResult as { message?: string }).message || "Failed to change milestone status";
          throw new Error(errorMsg);
        }
      }

      console.log("✅ Step 2/2: Milestone status changed to 'completed'");

      // 4. Update milestone status in database
      await updateMilestoneStatus(currentMilestone.id, "completed");
      
      // 5. Refresh data to reflect changes
      await fetchAllData();

      // 6. Reset checkbox state for next milestone
      setMilestoneCompleted(false);

      console.log("✅ Milestone completed successfully in database and smart contract (both flag and status updated)");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to complete milestone in smart contract";
      setApprovalError(errorMessage);
      console.error("❌ Error completing milestone:", error);
      
      // Don't update database if smart contract operations failed
      // The user can try again
    } finally {
      setIsApproving(false);
    }
  };

  return {
    project,
    milestones,
    loading,
    currentMilestone,
    escrowContractId,
    milestoneCompleted,
    setMilestoneCompleted,
    handleViewContract,
    handleMilestoneComplete,
    router,
    isApproving,
    approvalError,
  };
}

