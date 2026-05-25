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
import { createClient } from "@/lib/supabase/client";

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
			if (!project) {
				throw new Error("Project not found");
			}

			// Identify the acting user and their role on this project. The escrow
			// requires each action to be signed by the correct party using the
			// wallet held in their OWN session:
			//   - the contractor (approver) signs the approval
			//   - the freelancer (serviceProvider) signs the status change to "completed"
			// `getUserStellarWallet` only ever returns a PUBLIC key, so a contractor
			// can never sign on the freelancer's behalf. Previously the status change
			// was signed with the current user's key while declaring the freelancer as
			// serviceProvider, so the signature never matched the serviceProvider and
			// the escrow rejected it. Each party must therefore act from their own
			// session.
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			const currentUserId = user?.id;

			const isFreelancer =
				!!currentUserId && currentUserId === project.freelancer_id;
			const isContractor =
				!!currentUserId && currentUserId === project.contractor_id;

			if (!isFreelancer && !isContractor) {
				throw new Error(
					"Only the project contractor or freelancer can update this milestone.",
				);
			}

			const milestoneIndex = getMilestoneIndex(currentMilestone.id);

			const escrowMilestones = escrowData?.escrow?.milestones;
			const escrowMilestone =
				Array.isArray(escrowMilestones) && escrowMilestones[milestoneIndex]
					? (escrowMilestones[milestoneIndex] as {
							flags?: { approved?: boolean };
						})
					: undefined;

			if (isContractor) {
				// Contractor approves the milestone (sets flags.approved = true),
				// signing with their own wallet as the approver.
				if (escrowMilestone?.flags?.approved === true) {
					const errorMsg =
						"This milestone is already approved in the smart contract";
					setApprovalError(errorMsg);
					showError({ message: errorMsg }, "Already Approved");
					setIsApproving(false);
					return;
				}

				const approvalPayload: ApproveMilestonePayload = {
					contractId: escrowContractId,
					milestoneIndex: milestoneIndex.toString(),
					approver: wallet.publicKey,
				};

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

				await fetchAllData();
				await refetchEscrowDetails();
				setMilestoneCompleted(false);

				showSuccess(
					"Milestone Approved",
					`"${currentMilestone.title}" has been approved`,
				);
				return;
			}

			// Freelancer marks the milestone as completed. The escrow requires the
			// serviceProvider to sign this transaction, so we sign with the
			// freelancer's own session wallet and declare their own public key as the
			// serviceProvider. Guard against a wallet that doesn't match the
			// serviceProvider registered in the escrow.
			if (serviceProvider && serviceProvider !== wallet.publicKey) {
				throw new Error(
					"Your wallet does not match the service provider registered in this escrow.",
				);
			}

			const statusChangePayload: ChangeMilestoneStatusPayload = {
				contractId: escrowContractId,
				milestoneIndex: milestoneIndex.toString(),
				newStatus: "completed",
				serviceProvider: wallet.publicKey,
			};

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
				`"${currentMilestone.title}" has been marked as completed`,
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
