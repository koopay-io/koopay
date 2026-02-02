"use client";

import { useState } from "react";
import {
	useInitializeEscrow,
	useFundEscrow,
	useSendTransaction,
	useApproveMilestone,
	useChangeMilestoneStatus,
} from "@trustless-work/escrow/hooks";
import { Keypair, Transaction, Networks } from "@stellar/stellar-sdk";
import type {
	InitializeMultiReleaseEscrowPayload,
	FundEscrowPayload,
	InitializeMultiReleaseEscrowResponse,
	ApproveMilestonePayload,
	ChangeMilestoneStatusPayload,
} from "@trustless-work/escrow/types";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

/**
 * Helper function to sign Stellar transactions with a secret key
 */
const signTransactionWithSecretKey = (
	unsignedTxXdr: string,
	secretKey: string,
): string => {
	const keypair = Keypair.fromSecret(secretKey);
	const transaction = new Transaction(unsignedTxXdr, Networks.TESTNET);
	transaction.sign(keypair);
	return transaction.toXDR();
};

/**
 * Custom hook for deploying and funding Trustless Work escrows
 * with improved error handling and user feedback
 */
export const useEscrowWithSecretKey = () => {
	const { deployEscrow } = useInitializeEscrow();
	const { fundEscrow } = useFundEscrow();
	const { sendTransaction } = useSendTransaction();
	const { approveMilestone } = useApproveMilestone();
	const { changeMilestoneStatus } = useChangeMilestoneStatus();
	const { showError, showSuccess, showNetworkError } = useErrorToast();

	const [isDeploying, setIsDeploying] = useState(false);
	const [isFunding, setIsFunding] = useState(false);
	const [isApproving, setIsApproving] = useState(false);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	/**
	 * Deploy a multi-release escrow contract
	 */
	const deployMultiReleaseEscrow = async (
		payload: InitializeMultiReleaseEscrowPayload,
		contractorSecretKey: string,
	): Promise<InitializeMultiReleaseEscrowResponse> => {
		setIsDeploying(true);
		try {
			console.log("🔧 [Deploy Step 1/3] Calling deployEscrow API...");

			const unsignedTxResponse = await deployEscrow(
				payload,
				"multi-release",
			);
			const unsignedTx =
				typeof unsignedTxResponse === "string"
					? unsignedTxResponse
					: (
							unsignedTxResponse as {
								unsignedTx?: string;
								transaction?: string;
							}
						).unsignedTx ||
						(unsignedTxResponse as { transaction?: string })
							.transaction ||
						String(unsignedTxResponse);
			console.log("✅ [Deploy Step 1/3] Unsigned transaction received");

			console.log(
				"🔧 [Deploy Step 2/3] Signing transaction with secret key...",
			);
			const signedTx = signTransactionWithSecretKey(
				unsignedTx,
				contractorSecretKey,
			);
			console.log("✅ [Deploy Step 2/3] Transaction signed successfully");

			console.log(
				"🔧 [Deploy Step 3/3] Sending signed transaction to network...",
			);
			const result = await sendTransaction(signedTx);
			console.log("✅ [Deploy Step 3/3] Transaction submitted successfully");

			showSuccess(
				"Escrow Deployed",
				"Multi-release escrow contract deployed successfully",
			);
			return result as InitializeMultiReleaseEscrowResponse;
		} catch (error) {
			logError(error, "Deploy Escrow");

			if (isNetworkError(error)) {
				showNetworkError(() =>
					deployMultiReleaseEscrow(payload, contractorSecretKey),
				);
			} else {
				showError(error, "Failed to Deploy Escrow");
			}
			throw error;
		} finally {
			setIsDeploying(false);
		}
	};

	/**
	 * Fund a multi-release escrow contract
	 */
	const fundMultiReleaseEscrow = async (
		payload: FundEscrowPayload,
		contractorSecretKey: string,
	) => {
		setIsFunding(true);
		try {
			console.log("🔧 [Fund Step 1/3] Calling fundEscrow API...");

			const unsignedTxResponse = await fundEscrow(payload, "multi-release");

			// Check for API errors
			if (unsignedTxResponse && typeof unsignedTxResponse === "object") {
				const responseObj = unsignedTxResponse as {
					statusCode?: number;
					message?: string;
					error?: string;
				};

				if (responseObj.statusCode && responseObj.statusCode >= 400) {
					const errorMessage =
						responseObj.message ||
						responseObj.error ||
						`API error: ${responseObj.statusCode}`;

					// Handle specific error cases
					if (errorMessage.includes("insufficient balance")) {
						throw new Error(
							"Insufficient balance in your wallet. Please add USDC and try again.",
						);
					}
					throw new Error(errorMessage);
				}
			}

			// Extract unsigned transaction
			let unsignedTx: string | null = null;
			if (typeof unsignedTxResponse === "string") {
				unsignedTx = unsignedTxResponse;
			} else if (
				unsignedTxResponse &&
				typeof unsignedTxResponse === "object"
			) {
				const responseObj = unsignedTxResponse as {
					unsignedTransaction?: string;
					unsignedTx?: string;
					transaction?: string;
				};
				unsignedTx =
					responseObj.unsignedTransaction ||
					responseObj.unsignedTx ||
					responseObj.transaction ||
					null;
			}

			if (!unsignedTx) {
				throw new Error(
					"The API did not return a valid transaction to sign. Please try again.",
				);
			}

			console.log("✅ [Fund Step 1/3] Got unsigned transaction");
			console.log("🔧 [Fund Step 2/3] Signing transaction...");
			const signedTx = signTransactionWithSecretKey(
				unsignedTx,
				contractorSecretKey,
			);
			console.log("✅ [Fund Step 2/3] Transaction signed");

			console.log("🔧 [Fund Step 3/3] Submitting transaction...");
			const result = await sendTransaction(signedTx);
			console.log("✅ [Fund Step 3/3] Transaction submitted");

			showSuccess("Escrow Funded", "Escrow contract funded successfully");
			return result;
		} catch (error) {
			logError(error, "Fund Escrow");

			if (isNetworkError(error)) {
				showNetworkError(() =>
					fundMultiReleaseEscrow(payload, contractorSecretKey),
				);
			} else {
				showError(error, "Failed to Fund Escrow");
			}
			throw error;
		} finally {
			setIsFunding(false);
		}
	};

	/**
	 * Approve a milestone in a multi-release escrow contract
	 */
	const approveMilestoneInEscrow = async (
		payload: ApproveMilestonePayload,
		approverSecretKey: string,
	) => {
		setIsApproving(true);
		try {
			console.log(
				"🔧 [Approve Milestone Step 1/3] Calling approveMilestone API...",
			);

			const response = await approveMilestone(payload, "multi-release");
			const unsignedTx =
				typeof response === "string"
					? response
					: (response as { unsignedTransaction?: string })
							.unsignedTransaction ||
						(response as { unsignedTx?: string }).unsignedTx ||
						(response as { transaction?: string }).transaction ||
						String(response);

			if (!unsignedTx) {
				throw new Error(
					"Unsigned transaction is missing from approveMilestone response",
				);
			}

			console.log(
				"✅ [Approve Milestone Step 1/3] Unsigned transaction received",
			);
			console.log("🔧 [Approve Milestone Step 2/3] Signing transaction...");
			const signedTx = signTransactionWithSecretKey(
				unsignedTx,
				approverSecretKey,
			);
			console.log("✅ [Approve Milestone Step 2/3] Transaction signed");

			console.log(
				"🔧 [Approve Milestone Step 3/3] Submitting transaction...",
			);
			const result = await sendTransaction(signedTx);
			console.log("✅ [Approve Milestone Step 3/3] Transaction submitted");

			showSuccess("Milestone Approved", "Milestone approved successfully");
			return result;
		} catch (error) {
			logError(error, "Approve Milestone");

			if (isNetworkError(error)) {
				showNetworkError(() =>
					approveMilestoneInEscrow(payload, approverSecretKey),
				);
			} else {
				showError(error, "Failed to Approve Milestone");
			}
			throw error;
		} finally {
			setIsApproving(false);
		}
	};

	/**
	 * Change the status of a milestone
	 */
	const changeMilestoneStatusInEscrow = async (
		payload: ChangeMilestoneStatusPayload,
		serviceProviderSecretKey: string,
	) => {
		setIsChangingStatus(true);
		try {
			console.log("🔧 [Change Milestone Status Step 1/3] Calling API...");

			const response = await changeMilestoneStatus(payload, "multi-release");
			const unsignedTx =
				typeof response === "string"
					? response
					: (response as { unsignedTransaction?: string })
							.unsignedTransaction ||
						(response as { unsignedTx?: string }).unsignedTx ||
						(response as { transaction?: string }).transaction ||
						String(response);

			if (!unsignedTx) {
				throw new Error(
					"Unsigned transaction is missing from changeMilestoneStatus response",
				);
			}

			console.log(
				"✅ [Change Milestone Status Step 1/3] Unsigned transaction received",
			);
			console.log(
				"🔧 [Change Milestone Status Step 2/3] Signing transaction...",
			);
			const signedTx = signTransactionWithSecretKey(
				unsignedTx,
				serviceProviderSecretKey,
			);
			console.log(
				"✅ [Change Milestone Status Step 2/3] Transaction signed",
			);

			console.log(
				"🔧 [Change Milestone Status Step 3/3] Submitting transaction...",
			);
			const result = await sendTransaction(signedTx);
			console.log(
				"✅ [Change Milestone Status Step 3/3] Transaction submitted",
			);

			showSuccess("Status Updated", "Milestone status changed successfully");
			return result;
		} catch (error) {
			logError(error, "Change Milestone Status");

			if (isNetworkError(error)) {
				showNetworkError(() =>
					changeMilestoneStatusInEscrow(payload, serviceProviderSecretKey),
				);
			} else {
				showError(error, "Failed to Change Milestone Status");
			}
			throw error;
		} finally {
			setIsChangingStatus(false);
		}
	};

	return {
		deployMultiReleaseEscrow,
		fundMultiReleaseEscrow,
		approveMilestoneInEscrow,
		changeMilestoneStatusInEscrow,
		isDeploying,
		isFunding,
		isApproving,
		isChangingStatus,
	};
};
