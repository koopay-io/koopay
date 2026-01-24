"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { createEscrow, signTransactionWithSk } from "@/lib/stellar/trustless";
import { useSendTransaction } from "@trustless-work/escrow";
import { useContractGeneration } from "./useContractGeneration";
import { getUserStellarWallet } from "@/lib/actions/wallet";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

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
	project?: Record<string, unknown> & { id: string };
	contractId?: string;
	error?: string;
}

/**
 * Hook to create projects with simple, direct escrow deployment and improved error handling
 */
export const useProjectCreation = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { wallet } = useStellarWallet();
	const { sendTransaction } = useSendTransaction();
	const { generateContract } = useContractGeneration();
	const { showError, showSuccess, showNetworkError } = useErrorToast();
	const supabase = createClient();

	const createProjectWithEscrow = async (
		data: ProjectData,
	): Promise<CreateProjectResult> => {
		// Validation
		if (!wallet?.secretKey) {
			const errorMsg = "Contractor wallet not found. Please log in.";
			setError(errorMsg);
			showError({ message: errorMsg }, "Wallet Required");
			return { success: false, error: errorMsg };
		}

		if (!data.freelancer_id) {
			const errorMsg = "Please assign a freelancer to the project";
			setError(errorMsg);
			showError({ message: errorMsg }, "Freelancer Required");
			return { success: false, error: errorMsg };
		}

		if (!data.title || data.title.trim() === "") {
			const errorMsg = "Project title is required";
			setError(errorMsg);
			showError({ message: errorMsg }, "Validation Error");
			return { success: false, error: errorMsg };
		}

		if (data.total_amount <= 0) {
			const errorMsg = "Project amount must be greater than 0";
			setError(errorMsg);
			showError({ message: errorMsg }, "Validation Error");
			return { success: false, error: errorMsg };
		}

		// Validate milestones
		if (!data.milestones || data.milestones.length === 0) {
			const errorMsg = "At least one milestone is required";
			setError(errorMsg);
			showError({ message: errorMsg }, "Validation Error");
			return { success: false, error: errorMsg };
		}

		setIsLoading(true);
		setError(null);

		try {
			// Fetch freelancer wallet
			const freelancerWallet = await getUserStellarWallet(
				data.freelancer_id,
			);

			if (!freelancerWallet) {
				throw new Error(
					"Freelancer wallet not found. Please ensure freelancer has completed onboarding.",
				);
			}

			// Get unsigned transaction from API
			const escrowResult = await createEscrow(
				wallet,
				data,
				freelancerWallet,
			);
			const unsignedTx = escrowResult.unsignedTransaction;

			if (!unsignedTx) {
				throw new Error(
					"API did not return an unsigned transaction. Please try again.",
				);
			}

			// Sign the transaction
			const signedTxXdr = signTransactionWithSk(
				unsignedTx,
				wallet.secretKey!,
			);

			// Submit transaction
			const txResponse = await sendTransaction(signedTxXdr);

			// Extract contractId from response
			let contractId: string | null = null;

			if (
				"contractId" in txResponse &&
				typeof txResponse.contractId === "string"
			) {
				contractId = txResponse.contractId;
			} else if (
				"escrow" in txResponse &&
				typeof txResponse.escrow === "object" &&
				txResponse.escrow !== null
			) {
				const escrow = txResponse.escrow as { contractId?: string };
				if (escrow.contractId) {
					contractId = escrow.contractId;
				}
			}

			if (!contractId) {
				logError(
					{ message: "No contractId in response", response: txResponse },
					"Deploy Escrow",
				);
				throw new Error(
					"No contract ID returned from escrow deployment. Please try again.",
				);
			}

			// Save project to database
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error("User not authenticated. Please sign in again.");
			}

			// @ts-ignore
			const { data: project, error: projectError } = await supabase
				.from("projects")
				// @ts-ignore
				.insert({
					contractor_id: user.id,
					freelancer_id: data.freelancer_id,
					title: data.title,
					description: data.description,
					total_amount: data.total_amount,
					expected_delivery_date: data.expected_delivery_date,
					status: "active",
					contract_id: contractId,
				})
				.select()
				.single();

			if (projectError) {
				if (projectError.message.includes("permission")) {
					throw new Error(
						"You don't have permission to create projects. Please contact support.",
					);
				}
				throw new Error(`Failed to save project: ${projectError.message}`);
			}

			// Save milestones
			const baseTime = Date.now();
			const milestonesToInsert = data.milestones.map((milestone, index) => {
				const milestoneTimestamp = new Date(
					baseTime + index * 1000,
				).toISOString();
				return {
					// @ts-ignore
					project_id: project.id,
					title: milestone.title,
					description: milestone.description,
					percentage: milestone.percentage,
					status: "pending",
					created_at: milestoneTimestamp,
				};
			});

			const { error: milestonesError } = await supabase
				.from("milestones")
				// @ts-ignore
				.insert(milestonesToInsert);

			if (milestonesError) {
				throw new Error(
					`Failed to save milestones: ${milestonesError.message}`,
				);
			}

			// Generate contract PDF
			try {
				const { data: contractorOrgData } = await supabase
					.from("organizations")
					.select("*, user_organization!inner(user_id, email)")
					.eq("user_organization.user_id", user.id)
					.limit(1)
					.single();

				const { data: freelancerOrgData } = await supabase
					.from("organizations")
					.select("*, user_organization!inner(user_id, email)")
					.eq("user_organization.user_id", data.freelancer_id)
					.limit(1)
					.single();

				const freelancerEmail =
					freelancerOrgData?.user_organization?.[0]?.email || "";

				if (contractorOrgData && freelancerOrgData) {
					const contractorName =
						contractorOrgData.legal_type === "individual"
							? contractorOrgData.legal_name
							: contractorOrgData.name;

					const freelancerName =
						freelancerOrgData.legal_type === "individual"
							? freelancerOrgData.legal_name
							: freelancerOrgData.name;

					const contractorAddr = [
						contractorOrgData.legal_street_name,
						contractorOrgData.legal_street_number,
						contractorOrgData.legal_city,
						contractorOrgData.legal_country_id,
					]
						.filter(Boolean)
						.join(", ");

					const freelancerAddr = [
						freelancerOrgData.legal_street_name,
						freelancerOrgData.legal_street_number,
						freelancerOrgData.legal_city,
						freelancerOrgData.legal_country_id,
					]
						.filter(Boolean)
						.join(", ");

					const contractResult = await generateContract(
						{
							fullName: contractorName,
							legalName: contractorOrgData.legal_name,
							displayName: contractorOrgData.name,
							individualId: contractorOrgData.legal_id,
							businessId: contractorOrgData.legal_id,
							country: String(
								contractorOrgData.legal_country_id || "Unknown",
							),
							address: contractorAddr,
							email: user.email || "",
						},
						{
							fullName: freelancerName,
							freelancerId: freelancerOrgData.legal_id,
							country: String(
								freelancerOrgData.legal_country_id || "Unknown",
							),
							address: freelancerAddr,
							email: freelancerEmail,
						},
						{
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
						},
					);

					if (contractResult.success && contractResult.contractUrl) {
						await supabase
							.from("projects")
							// @ts-ignore
							.update({ contract_url: contractResult.contractUrl })
							.eq("id", project.id);
					}
				}
			} catch (contractError) {
				logError(contractError, "Generate Contract PDF");
				console.error("⚠️ Failed to generate contract PDF:", contractError);
				// Don't fail the whole project creation if contract generation fails
			}

			showSuccess(
				"Project Created",
				`"${data.title}" created successfully with escrow contract!`,
			);
			setIsLoading(false);
			return { success: true, project, contractId };
		} catch (err) {
			logError(err, "Create Project with Escrow");
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error occurred";
			setError(errorMessage);
			setIsLoading(false);

			if (isNetworkError(err)) {
				showNetworkError(() => createProjectWithEscrow(data));
			} else if (errorMessage.includes("wallet not found")) {
				showError({ message: errorMessage }, "Wallet Required");
			} else if (errorMessage.includes("permission")) {
				showError({ message: errorMessage }, "Permission Denied");
			} else {
				showError(err, "Failed to Create Project");
			}

			return { success: false, error: errorMessage };
		}
	};

	return { createProjectWithEscrow, isLoading, error };
};
