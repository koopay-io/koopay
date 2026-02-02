"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { useEscrowWithSecretKey } from "./useEscrowWithSecretKey";
import { StellarWalletManager } from "@/lib/stellar/wallet";
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

import { Database } from "@/lib/supabase/types/database.gen";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface CreateProjectResult {
	success: boolean;
	project?: Project;
	contractId?: string;
	error?: string;
}

/**
 * Hook to create projects with automatic escrow deployment and improved error handling
 */
export const useProjectCreation = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { wallet } = useStellarWallet();
	const { deployMultiReleaseEscrow, fundMultiReleaseEscrow } =
		useEscrowWithSecretKey();
	const { showError, showSuccess, showNetworkError } = useErrorToast();
	const supabase = createClient();

	/**
	 * Validate milestones sum to 100%
	 */
	const validateMilestones = (milestones: Milestone[]): boolean => {
		const totalPercentage = milestones.reduce(
			(sum, m) => sum + m.percentage,
			0,
		);
		return totalPercentage === 100;
	};

	/**
	 * Create a project with automatic escrow deployment
	 */
	const createProjectWithEscrow = async (
		data: ProjectData,
	): Promise<CreateProjectResult> => {
		// Validation: Check contractor wallet
		if (!wallet?.secretKey) {
			const errorMsg =
				"Contractor wallet not found. Please ensure you're logged in.";
			setError(errorMsg);
			showError({ message: errorMsg }, "Wallet Required");
			return { success: false, error: errorMsg };
		}

		// Validation: Check milestones sum to 100%
		if (!validateMilestones(data.milestones)) {
			const errorMsg = "Milestones must sum to 100%";
			setError(errorMsg);
			showError({ message: errorMsg }, "Invalid Milestones");
			return { success: false, error: errorMsg };
		}

		// Validation: Check freelancer is assigned
		if (!data.freelancer_id) {
			const errorMsg = "Please assign a freelancer to the project";
			setError(errorMsg);
			showError({ message: errorMsg }, "Freelancer Required");
			return { success: false, error: errorMsg };
		}

		// Validation: Check project data
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

		setIsLoading(true);
		setError(null);

		try {
			// Get environment variables
			const platformFee = Number(
				process.env.NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE || "1.5",
			);
			const adminPk = process.env.NEXT_PUBLIC_TRUSTLESS_ADMIN_PK || "";
			const skipEscrow =
				process.env.NEXT_PUBLIC_TRUSTLESS_SKIP_ESCROW === "true";

			if (!adminPk) {
				throw new Error(
					"Platform admin public key not configured. Please contact support.",
				);
			}

			// DEVELOPMENT MODE: Skip escrow deployment
			if (skipEscrow) {
				console.warn("⚠️ DEVELOPMENT MODE: Skipping escrow deployment");

				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					throw new Error("User not authenticated. Please sign in again.");
				}

				// Save project directly to database
				const projectInsert = {
					contractor_id: user.id,
					freelancer_id: data.freelancer_id,
					title: data.title,
					description: data.description,
					total_amount: data.total_amount,
					expected_delivery_date: data.expected_delivery_date,
					status: "pending",
					contract_id: `mock-contract-${Date.now()}`,
				} as const;

				const { data: project, error: projectError } = await supabase
					.from("projects")
					.insert(projectInsert as unknown as never)
					.select()
					.single();

				if (projectError) {
					if (projectError.message.includes("permission")) {
						throw new Error(
							"You don't have permission to create projects. Please contact support.",
						);
					}
					throw projectError;
				}

				if (!project || !("id" in project)) {
					throw new Error("Project creation failed. Please try again.");
				}

				const projectId = (project as { id: string }).id;

				// Save milestones
				const milestonesToInsert = data.milestones.map((milestone) => ({
					project_id: projectId,
					title: milestone.title,
					description: milestone.description,
					percentage: milestone.percentage,
					deadline: milestone.deadline,
					status: "pending",
				}));

				const { error: milestonesError } = await supabase
					.from("milestones")
					.insert(milestonesToInsert as unknown as never[]);

				if (milestonesError) throw milestonesError;

				showSuccess(
					"Project Created",
					`"${data.title}" created successfully in development mode`,
				);
				return {
					success: true,
					project,
					contractId: `mock-contract-${Date.now()}`,
				};
			}

			// PRODUCTION MODE: Full escrow deployment
			const stellarManager = new StellarWalletManager("testnet");

			// 1. Verify contractor account
			const accountExists = await stellarManager.accountExists(
				wallet.publicKey,
			);

			if (!accountExists) {
				const funded = await stellarManager.fundTestnetAccount(
					wallet.publicKey,
				);
				if (!funded) {
					throw new Error(
						"Failed to fund contractor account. Please ensure you're connected to testnet.",
					);
				}
				await new Promise((resolve) => setTimeout(resolve, 5000));
				console.log("✅ Contractor account funded");
			} else {
				console.log("✅ Contractor account already exists");
			}

			// 2. Get freelancer wallet
			const freelancerWallet = await getUserStellarWallet(
				data.freelancer_id,
			);
			if (!freelancerWallet) {
				throw new Error(
					"Freelancer wallet not found. Please ensure freelancer has completed onboarding.",
				);
			}

			// 3. Setup USDC trustline
			const usdcIssuer =
				"GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

			try {
				await stellarManager.establishTrustline(
					wallet.secretKey,
					"USDC",
					usdcIssuer,
				);
			} catch (trustlineError) {
				console.warn("Trustline setup:", trustlineError);
			}

			await new Promise((resolve) => setTimeout(resolve, 2000));

			// 4. Swap XLM to USDC
			const swapAmount = (data.total_amount * 1.1).toFixed(7);
			const swapped = await stellarManager.swapXLMtoUSDC(
				wallet.secretKey,
				swapAmount,
				usdcIssuer,
			);

			if (!swapped) {
				console.warn("⚠️ Could not obtain USDC automatically");
			} else {
				await new Promise((resolve) => setTimeout(resolve, 3000));
			}

			// 5. Check balances
			const contractorBalance = await stellarManager.getBalance(
				wallet.publicKey,
			);
			const contractorHasUSDC = contractorBalance.some(
				(b) => b.asset === "USDC",
			);

			if (!contractorHasUSDC) {
				console.warn("⚠️ Contractor doesn't have USDC");
			}

			// 6. Deploy escrow
			const escrowPayload: any = {
				signer: wallet.publicKey,
				engagementId: `project-${Date.now()}`,
				title: data.title,
				description: data.description,
				roles: {
					approver: wallet.publicKey,
					serviceProvider: freelancerWallet,
					platformAddress: wallet.publicKey,
					release: wallet.publicKey,
					disputeResolver: wallet.publicKey,
				},
				platformFee,
				milestones: data.milestones.map((m) => ({
					description: m.title,
					amount: data.total_amount * (m.percentage / 100),
					receiver: freelancerWallet,
				})),
				trustline: {
					address: usdcIssuer,
					symbol: "USDC",
				},
				receiverMemo: Date.now() % 1000000,
			};

			const deployResult = await deployMultiReleaseEscrow(
				escrowPayload,
				wallet.secretKey,
			);
			const contractId = deployResult.contractId;

			// 7. Fund escrow
			await fundMultiReleaseEscrow(
				{
					amount: data.total_amount,
					contractId,
					signer: wallet.publicKey,
				},
				wallet.secretKey,
			);

			// 8. Save to database
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("User not authenticated");

			const projectInsert = {
				contractor_id: user.id,
				freelancer_id: data.freelancer_id,
				title: data.title,
				description: data.description,
				total_amount: data.total_amount,
				expected_delivery_date: data.expected_delivery_date,
				status: "active",
				contract_id: contractId,
			} as const;

			const { data: project, error: projectError } = await supabase
				.from("projects")
				.insert(projectInsert as unknown as never)
				.select()
				.single();

			if (projectError) throw projectError;
			if (!project || !("id" in project))
				throw new Error("Project creation failed");

			const projectId = (project as { id: string }).id;

			// 9. Save milestones
			const baseTime = Date.now();
			const milestonesData = data.milestones.map((m, index) => {
				const milestoneTimestamp = new Date(
					baseTime + index * 1000,
				).toISOString();
				return {
					project_id: projectId,
					title: m.title,
					description: m.description,
					percentage: m.percentage,
					deadline: m.deadline,
					status: "pending",
					created_at: milestoneTimestamp,
				};
			});

			const { error: milestonesError } = await supabase
				.from("milestones")
				.insert(milestonesData as unknown as never[]);

			if (milestonesError) throw milestonesError;

			showSuccess(
				"Project Created",
				`"${data.title}" created and funded successfully!`,
			);
			setIsLoading(false);
			return { success: true, project, contractId };
		} catch (err: unknown) {
			logError(err, "Create Project");

			const error = err as {
				response?: { status: number; data?: { message?: string } };
				message?: string;
			};

			let errorMsg = "Failed to create project";

			if (error.response?.data?.message) {
				errorMsg = error.response.data.message;
			} else if (error.message) {
				errorMsg = error.message;
			}

			setError(errorMsg);
			setIsLoading(false);

			if (isNetworkError(err)) {
				showNetworkError(() => createProjectWithEscrow(data));
			} else if (errorMsg.includes("insufficient balance")) {
				showError(
					{
						message:
							"Insufficient balance. Please add funds to your wallet.",
					},
					"Insufficient Funds",
				);
			} else if (errorMsg.includes("not found")) {
				showError({ message: errorMsg }, "Resource Not Found");
			} else if (errorMsg.includes("permission")) {
				showError({ message: errorMsg }, "Permission Denied");
			} else {
				showError(err, "Failed to Create Project");
			}

			return { success: false, error: errorMsg };
		}
	};

	return { createProjectWithEscrow, isLoading, error };
};
