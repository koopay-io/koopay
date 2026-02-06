"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectMilestones } from "./useProjectMilestones";
import { getEscrowContractId } from "@/lib/utils/projectHelpers";
import { extractTransactionHash } from "@/lib/utils/stellar";
import { useStellarWallet } from "./useStellarWallet";
import { useEscrowWithSecretKey } from "./useEscrowWithSecretKey";
import { useEscrowDetails } from "./useEscrowDetails";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";
import type {
	ApproveMilestonePayload,
	ChangeMilestoneStatusPayload,
} from "@trustless-work/escrow/types";
import { getUserStellarWallet } from "@/lib/actions/wallet";

/**
 * Custom hook to manage project page state and handlers with improved error handling
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
	const { approveMilestoneInEscrow, changeMilestoneStatusInEscrow } =
		useEscrowWithSecretKey();
	const { showError, showSuccess, showNetworkError } = useErrorToast();

	const currentMilestone = getCurrentMilestone();
	const escrowContractId = getEscrowContractId(project);
	const {
		escrowData,
		fundingStatus,
		usdcBalance,
		refetch: refetchEscrowDetails,
	} = useEscrowDetails(escrowContractId, project?.total_amount);

	const serviceProvider =
		escrowData?.escrow?.roles &&
		typeof escrowData.escrow.roles === "object" &&
		!Array.isArray(escrowData.escrow.roles)
			? (escrowData.escrow.roles as { serviceProvider?: string })
					.serviceProvider
			: null;

	/**
	 * Calculate the milestone index in the escrow
	 */
	const getMilestoneIndex = (milestoneId: string): number => {
		const milestone = milestones.find((m) => m.id === milestoneId);
		if (!milestone) {
			console.warn("Milestone not found in database, defaulting to index 0");
			return 0;
		}

		const escrowMilestones = escrowData?.escrow?.milestones;
		if (!escrowMilestones || !Array.isArray(escrowMilestones)) {
			console.warn("Escrow milestones not available, using database order");
			return milestones.findIndex((m) => m.id === milestoneId);
		}

		const milestoneTitle = milestone.title;
		const index = escrowMilestones.findIndex((escrowMilestone: unknown) => {
			if (typeof escrowMilestone === "object" && escrowMilestone !== null) {
				const escrowM = escrowMilestone as { description?: string };
				return escrowM.description === milestoneTitle;
			}
			return false;
		});

		if (index >= 0) {
			console.log(
				`✅ Found milestone "${milestoneTitle}" at escrow index ${index}`,
			);
			return index;
		}

		console.warn(
			`⚠️ Milestone "${milestoneTitle}" not found in escrow, defaulting to index 0`,
		);
		return 0;
	};

	const handleViewContract = () => {
		const contractUrl = project?.contract_url as string | undefined;
		if (contractUrl) {
			window.open(contractUrl, "_blank");
		} else if (escrowContractId) {
			router.push(`/projects/${projectId}/test-escrow`);
		} else {
			const errorMsg = "No contract available for this project yet.";
			showError({ message: errorMsg }, "Contract Not Found");
			console.error(errorMsg);
		}
	};

	const handleMilestoneComplete = async () => {
		if (!currentMilestone) {
			showError({ message: "No active milestone found" }, "Milestone Error");
			return;
		}

		if (!escrowContractId) {
			const errorMsg = "No escrow contract found for this project";
			setApprovalError(errorMsg);
			showError({ message: errorMsg }, "Escrow Not Found");
			return;
		}

		if (!wallet?.secretKey || !wallet?.publicKey) {
			const errorMsg =
				"Wallet not available. Please ensure you're logged in.";
			setApprovalError(errorMsg);
			showError({ message: errorMsg }, "Wallet Required");
			return;
		}

		if (!serviceProvider) {
			const errorMsg =
				"Service provider not found in escrow. Please wait for escrow data to load.";
			setApprovalError(errorMsg);
			showError({ message: errorMsg }, "Escrow Data Loading");
			return;
		}

		setIsApproving(true);
		setApprovalError(null);

		try {
			// Calculate milestone index
			const milestoneIndex = getMilestoneIndex(currentMilestone.id);

			// Check if already approved
			const escrowMilestones = escrowData?.escrow?.milestones;
			if (
				escrowMilestones &&
				Array.isArray(escrowMilestones) &&
				escrowMilestones[milestoneIndex]
			) {
				const escrowMilestone = escrowMilestones[milestoneIndex] as {
					flags?: { approved?: boolean };
				};
				if (escrowMilestone.flags?.approved === true) {
					const errorMsg =
						"This milestone is already approved in the smart contract";
					setApprovalError(errorMsg);
					showError({ message: errorMsg }, "Already Approved");
					setIsApproving(false);
					return;
				}
			}

			// Step 1: Approve milestone
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
				wallet.secretKey,
			);

			if (approvalResult && typeof approvalResult === "object") {
				const status = (approvalResult as { status?: string }).status;
				if (status === "ERROR") {
					const errorMsg =
						(approvalResult as { message?: string }).message ||
						"Failed to approve milestone";
					throw new Error(errorMsg);
				}
			}

			console.log("✅ Step 1/2: Milestone approved");

			// Step 2: Determine collaborator wallet address
			let freelancerWallet: string | null =
				project?.freelancer_address ?? null;

			if (!freelancerWallet) {
				if (!project?.freelancer_id) {
					throw new Error("Project not found or collaborator not assigned");
				}

				freelancerWallet = await getUserStellarWallet(project.freelancer_id);
			}

			if (!freelancerWallet) {
				throw new Error(
					"Collaborator wallet not found. Ask them to provide a Stellar address.",
				);
			}

			// Step 3: Change milestone status
			const statusChangePayload: ChangeMilestoneStatusPayload = {
				contractId: escrowContractId,
				milestoneIndex: milestoneIndex.toString(),
				newStatus: "completed",
				serviceProvider: freelancerWallet,
			};

			console.log("🔧 Step 2/2: Changing milestone status to 'completed'");

			const statusChangeResult = await changeMilestoneStatusInEscrow(
				statusChangePayload,
				wallet.secretKey,
			);

			if (statusChangeResult && typeof statusChangeResult === "object") {
				const status = (statusChangeResult as { status?: string }).status;
				if (status === "ERROR") {
					const errorMsg =
						(statusChangeResult as { message?: string }).message ||
						"Failed to change milestone status";
					throw new Error(errorMsg);
				}
			}

			console.log("✅ Step 2/2: Milestone status changed");

			// Extract transaction hash from result
			const txHash = extractTransactionHash(statusChangeResult);

			// Update database with payment hash
			await updateMilestoneStatus(currentMilestone.id, "completed", txHash);

			// Refresh data
			await fetchAllData();
			await refetchEscrowDetails();

			// Reset state
			setMilestoneCompleted(false);

			showSuccess(
				"Milestone Completed",
				`"${currentMilestone.title}" has been approved and payment released`,
			);

			console.log(
				"✅ Milestone completed successfully",
				txHash ? `(tx: ${txHash})` : "",
			);
		} catch (error) {
			logError(error, "Complete Milestone");
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to complete milestone in smart contract";
			setApprovalError(errorMessage);

			if (isNetworkError(error)) {
				showNetworkError(handleMilestoneComplete);
			} else if (errorMessage.includes("insufficient balance")) {
				showError(
					{
						message:
							"Insufficient balance in escrow to release payment. Please fund the escrow first.",
					},
					"Insufficient Funds",
				);
			} else if (errorMessage.includes("not found")) {
				showError({ message: errorMessage }, "Resource Not Found");
			} else {
				showError(error, "Failed to Complete Milestone");
			}
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
		escrowFundingStatus: fundingStatus,
		escrowUsdcBalance: usdcBalance,
		refetchEscrowDetails,
		milestoneCompleted,
		setMilestoneCompleted,
		handleViewContract,
		handleMilestoneComplete,
		router,
		isApproving,
		approvalError,
	};
}
