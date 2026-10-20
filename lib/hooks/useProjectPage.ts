"use client";

import { useState, useEffect, useCallback } from "react";
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
import { createClient } from "@/lib/supabase/client";

/**
 * Custom hook to manage project page state and handlers with role-aware milestone approval & completion
 */
export function useProjectPage(projectId: string) {
	const router = useRouter();
	const [milestoneCompleted, setMilestoneCompleted] = useState(false);
	const [isApproving, setIsApproving] = useState(false);
	const [approvalError, setApprovalError] = useState<string | null>(null);
	const [transactionHash, setTransactionHash] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

	// Fetch logged-in user to determine role
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const supabase = createClient();
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user?.id) {
					setCurrentUserId(user.id);
				}
			} catch (err) {
				console.warn("Could not fetch current auth user:", err);
			}
		};
		fetchUser();
	}, []);

	// Role flags
	const isContractor =
		!!currentUserId &&
		!!project?.contractor_id &&
		currentUserId === project.contractor_id;
	const isFreelancer =
		!!currentUserId &&
		!!project?.freelancer_id &&
		currentUserId === project.freelancer_id;

	/**
	 * Calculate the milestone index in the escrow
	 */
	const getMilestoneIndex = useCallback(
		(milestoneId: string): number => {
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
				return index;
			}

			console.warn(
				`⚠️ Milestone "${milestoneTitle}" not found in escrow, defaulting to index 0`,
			);
			return 0;
		},
		[milestones, escrowData],
	);

	const currentMilestoneIndex = currentMilestone
		? getMilestoneIndex(currentMilestone.id)
		: 0;

	const escrowMilestones = escrowData?.escrow?.milestones;
	const escrowMilestone =
		Array.isArray(escrowMilestones) && escrowMilestones[currentMilestoneIndex]
			? (escrowMilestones[currentMilestoneIndex] as {
					flags?: { approved?: boolean; completed?: boolean };
					status?: string;
				})
			: undefined;

	const isMilestoneApproved = escrowMilestone?.flags?.approved === true;
	const isMilestoneCompleted =
		currentMilestone?.status === "completed" ||
		escrowMilestone?.flags?.completed === true;

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

	/**
	 * Step 1: Contractor approves the milestone in escrow (sets flags.approved = true)
	 */
	const handleMilestoneApprove = async () => {
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

		if (isMilestoneApproved) {
			const errorMsg =
				"This milestone is already approved in the smart contract";
			setApprovalError(errorMsg);
			showError({ message: errorMsg }, "Already Approved");
			return;
		}

		setIsApproving(true);
		setApprovalError(null);

		try {
			const milestoneIndex = getMilestoneIndex(currentMilestone.id);

			const approvalPayload: ApproveMilestonePayload = {
				contractId: escrowContractId,
				milestoneIndex: milestoneIndex.toString(),
				approver: wallet.publicKey,
			};

			console.log("🔧 Approving milestone in escrow:", {
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

			const txHash = extractTransactionHash(approvalResult);
			if (txHash) {
				setTransactionHash(txHash);
			}

			await fetchAllData();
			await refetchEscrowDetails();

			showSuccess(
				"Milestone Approved",
				`"${currentMilestone.title}" has been approved. The freelancer can now mark it complete to release funds.`,
			);
		} catch (error) {
			logError(error, "Approve Milestone");
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to approve milestone in smart contract";
			setApprovalError(errorMessage);

			if (isNetworkError(error)) {
				showNetworkError(handleMilestoneApprove);
			} else {
				showError(error, "Failed to Approve Milestone");
			}
		} finally {
			setIsApproving(false);
		}
	};

	/**
	 * Step 2: Freelancer marks the milestone as completed in escrow, releasing payment
	 */
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

		// Contractor triggering this flow when milestone isn't approved yet:
		// redirect to approve flow
		if (isContractor && !isMilestoneApproved) {
			await handleMilestoneApprove();
			return;
		}

		if (!project?.freelancer_id) {
			const errorMsg = "Project not found or freelancer not assigned";
			setApprovalError(errorMsg);
			showError({ message: errorMsg }, "Resource Not Found");
			return;
		}

		setIsApproving(true);
		setApprovalError(null);

		try {
			const milestoneIndex = getMilestoneIndex(currentMilestone.id);

			// Retrieve the freelancer's registered Stellar wallet public key
			const freelancerWallet = await getUserStellarWallet(
				project.freelancer_id,
			);
			if (!freelancerWallet) {
				throw new Error(
					"Freelancer wallet not found. Please ensure freelancer has completed onboarding.",
				);
			}

			// Validate signer wallet if acting as the freelancer
			if (isFreelancer && wallet.publicKey !== freelancerWallet) {
				throw new Error(
					`Connected wallet (${wallet.publicKey}) does not match the registered freelancer wallet (${freelancerWallet}).`,
				);
			}

			// Change milestone status in escrow to "completed" using freelancerWallet as serviceProvider
			const statusChangePayload: ChangeMilestoneStatusPayload = {
				contractId: escrowContractId,
				milestoneIndex: milestoneIndex.toString(),
				newStatus: "completed",
				serviceProvider: freelancerWallet,
			};

			console.log(
				"🔧 Changing milestone status to 'completed' with serviceProvider:",
				freelancerWallet,
			);

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
			if (txHash) {
				setTransactionHash(txHash);
			}

			// Update database with payment hash
			await updateMilestoneStatus(currentMilestone.id, "completed", txHash);

			// Refresh data
			await fetchAllData();
			await refetchEscrowDetails();

			// Reset state
			setMilestoneCompleted(false);

			showSuccess(
				"Milestone Completed & Payment Released",
				`"${currentMilestone.title}" has been completed and payment released!${
					txHash ? ` Tx: ${txHash.slice(0, 8)}...` : ""
				}`,
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
		handleMilestoneApprove,
		handleMilestoneComplete,
		router,
		isApproving,
		approvalError,
		transactionHash,
		isContractor,
		isFreelancer,
		isMilestoneApproved,
		isMilestoneCompleted,
	};
}
