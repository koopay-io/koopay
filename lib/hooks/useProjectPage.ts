"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectMilestones } from "./useProjectMilestones";
import { getEscrowContractId } from "@/lib/utils/project-helpers";

/**
 * Custom hook to manage project page state and handlers
 */
export function useProjectPage(projectId: string) {
  const router = useRouter();
  const [milestoneCompleted, setMilestoneCompleted] = useState(false);

  const {
    project,
    milestones,
    loading,
    fetchAllData,
    updateMilestoneStatus,
    getCurrentMilestone,
  } = useProjectMilestones(projectId);

  const currentMilestone = getCurrentMilestone();
  const escrowContractId = getEscrowContractId(project);

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

    try {
      await updateMilestoneStatus(currentMilestone.id, "completed");
      setMilestoneCompleted(true);
      await fetchAllData();
    } catch (error) {
      console.error("Error completing milestone:", error);
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
  };
}

