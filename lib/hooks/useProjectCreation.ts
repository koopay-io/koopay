"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "./useStellarWallet";
import { useEscrowWithSecretKey } from "./useEscrowWithSecretKey";
import { StellarWalletManager } from "@/lib/stellar/wallet";

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
  project?: {
    id: string;
    contractor_id: string;
    freelancer_id: string | null;
    title: string;
    description: string;
    total_amount: number;
    expected_delivery_date: string;
    status: string;
    contact_id: string;
  };
  contractId?: string;
  error?: string;
}

/**
 * Hook to create projects with automatic escrow deployment
 * 
 * This hook orchestrates the complete flow:
 * 1. Validates contractor wallet and milestones
 * 2. Deploys multi-release escrow contract
 * 3. Funds the escrow with project amount
 * 4. Saves project and milestones to database
 * 
 * Uses invisible wallets created with Stellar SDK instead of Wallet Kit
 */
export const useProjectCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallet } = useStellarWallet(); // Wallet del contractor
  const { deployMultiReleaseEscrow, fundMultiReleaseEscrow } = useEscrowWithSecretKey();
  const supabase = createClient();

  /**
   * Validate milestones sum to 100%
   */
  const validateMilestones = (milestones: Milestone[]): boolean => {
    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    return totalPercentage === 100;
  };

  /**
   * Create a project with automatic escrow deployment
   * 
   * @param data - Project data including title, description, milestones, etc.
   * @returns Result object with success status and project data
   */
  const createProjectWithEscrow = async (data: ProjectData): Promise<CreateProjectResult> => {
    // Validation: Check contractor wallet
    if (!wallet?.secretKey) {
      const errorMsg = "Contractor wallet not found. Please ensure you're logged in.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validation: Check milestones sum to 100%
    if (!validateMilestones(data.milestones)) {
      const errorMsg = "Milestones must sum to 100%";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validation: Check freelancer is assigned
    if (!data.freelancer_id) {
      const errorMsg = "Please assign a freelancer to the project";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get environment variables
      const platformFee = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE || "1.5");
      const adminPk = process.env.NEXT_PUBLIC_ADMIN_PK || "";
      const skipEscrow = process.env.NEXT_PUBLIC_SKIP_ESCROW === "true";

      if (!adminPk) {
        throw new Error("Platform admin public key not configured");
      }

      // 🔧 DEVELOPMENT MODE: Skip escrow deployment
      if (skipEscrow) {
        console.warn("⚠️⚠️⚠️ DEVELOPMENT MODE: Skipping escrow deployment ⚠️⚠️⚠️");
        console.log("Creating project without blockchain escrow...");
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Save project directly to database without escrow
        const projectInsert = {
          contractor_id: user.id,
          freelancer_id: data.freelancer_id,
          title: data.title,
          description: data.description,
          total_amount: data.total_amount,
          expected_delivery_date: data.expected_delivery_date,
          status: "pending",
          contract_id: `mock-contract-${Date.now()}`, // Mock contract ID
        } as const;

        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert(projectInsert as unknown as never)
          .select()
          .single();

        if (projectError) throw projectError;
        if (!project || !('id' in project)) throw new Error('Project creation failed');
        
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

        console.log("✅ Project created successfully (without escrow)");
        return { 
          success: true, 
          project,
          contractId: `mock-contract-${Date.now()}`,
        };
      }

      // 1. Verify and fund contractor's account if needed
      const stellarManager = new StellarWalletManager("testnet");
      const accountExists = await stellarManager.accountExists(wallet.publicKey);
      
      if (!accountExists) {
        console.log("💰 Funding contractor account with testnet XLM...");
        const funded = await stellarManager.fundTestnetAccount(wallet.publicKey);
        if (!funded) {
          throw new Error("Failed to fund contractor account. Please ensure you're connected to testnet.");
        }
        // Wait for account to be created on the network
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("✅ Contractor account funded");
      } else {
        console.log("✅ Contractor account already exists");
      }

      // 2. Get freelancer's Stellar wallet public key
      // TODO: Query freelancer's wallet from user_metadata properly
      // For now, using CONTRACTOR'S OWN wallet for testing (since we don't have admin secret key)
      console.log("⚠️ Using contractor's own wallet as freelancer for testing");
      console.log("💡 In production, this would be the actual freelancer's wallet");
      const freelancerPublicKey = wallet.publicKey; // Use contractor's own wallet for testing

      // 3. Setup USDC (Trustless Work requires a trustline asset)
      const usdcIssuer = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
      
      console.log("🔗 Step 1: Establishing USDC trustline for contractor...");
      try {
        await stellarManager.establishTrustline(wallet.secretKey, "USDC", usdcIssuer);
        console.log("✅ Contractor USDC trustline established");
      } catch {
        console.log("⚠️ Contractor trustline might already exist");
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // IMPORTANT: Admin account also needs USDC trustline (he's the receiver)
      console.log("🔗 Step 1b: Verifying admin account has USDC trustline...");
      console.log(`⚠️ CRITICAL: Admin account ${adminPk} must have USDC trustline!`);
      console.log("⚠️ If the admin account doesn't have USDC trustline, the escrow will fail!");
      console.log("⚠️ Please manually establish trustline for admin account if needed.");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("💱 Step 2: Attempting to swap XLM for USDC...");
      // Format amount with max 7 decimals (Stellar requirement)
      const swapAmount = (data.total_amount * 1.1).toFixed(7);
      const swapped = await stellarManager.swapXLMtoUSDC(wallet.secretKey, swapAmount, usdcIssuer);
      
      if (!swapped) {
        console.warn(
          "⚠️ Could not obtain USDC automatically (expected in testnet). " +
          "In production, users will purchase USDC from exchanges or on-ramps."
        );
        console.log("🔄 Continuing with deployment anyway for testing purposes...");
        // In production, this would be a hard error
        // throw new Error("No USDC available");
      } else {
        console.log("✅ USDC adquirido exitosamente");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // 4. Check balances of all involved accounts
      console.log("\n💰 Checking balances of all accounts...");
      const contractorBalance = await stellarManager.getBalance(wallet.publicKey);
      console.log("💰 Contractor balance:", contractorBalance);
      
      try {
        const adminBalance = await stellarManager.getBalance(adminPk);
        console.log("💰 Admin/Receiver balance:", adminBalance);
      } catch (error) {
        console.error("❌ Admin account doesn't exist or has issues:", error);
      }
      
      // 5. Validate accounts
      console.log("\n🔍 Validating accounts...");
      console.log("✓ Contractor PK:", wallet.publicKey);
      console.log("✓ Admin/Receiver PK:", adminPk);
      console.log("✓ USDC Issuer:", usdcIssuer);
      
      const contractorHasUSDC = contractorBalance.some(b => b.asset === "USDC");
      console.log(contractorHasUSDC ? "✅ Contractor HAS USDC" : "❌ Contractor DOES NOT have USDC");
      
      // 6. Deploy escrow contract with USDC
      console.log("\n🚀 Step 3: Deploying escrow contract with USDC...");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const escrowPayload: any = {
        signer: wallet.publicKey, // ✅ Moved to first position (matches Scalar example)
        engagementId: `project-${Date.now()}`,
        title: data.title,
        description: data.description,
        // 🔧 FIX: According to Scalar docs example:
        // - Use "release" instead of "releaseSigner"
        // - NO "receiver" in roles (only in milestones)
        roles: {
          approver: wallet.publicKey, // Contractor approves milestones
          serviceProvider: freelancerPublicKey, // Freelancer provides service (Stellar PK)
          platformAddress: wallet.publicKey, // Using contractor's account for testing (admin needs USDC trustline)
          release: wallet.publicKey, // ⚠️ "release" NOT "releaseSigner" (per Scalar example)
          disputeResolver: wallet.publicKey, // Using contractor's account for testing
        },
        platformFee, // Must be a number (not string) - Currently 1.5 from env
        milestones: data.milestones.map((m) => ({
          description: m.title,
          amount: data.total_amount * (m.percentage / 100), // Must be a number (not string)
          receiver: freelancerPublicKey, // Each milestone needs a receiver address (API requirement)
        })),
        // 🔧 FIX: According to Scalar docs example, trustline is an OBJECT (not array)
        trustline: {
          address: usdcIssuer, // USDC testnet issuer
        },
        // 🔧 FIX: Adding receiverMemo field (was missing - might be required by API)
        // Field used to identify recipient's address in transactions through intermediary account
        receiverMemo: Date.now() % 1000000, // Generate a unique 6-digit memo
      };

      console.log("📦 Sending escrow payload:", JSON.stringify(escrowPayload, null, 2));
      const deployResult = await deployMultiReleaseEscrow(escrowPayload, wallet.secretKey);
      const contractId = deployResult.contractId;
      console.log("✅ Escrow deployed:", contractId);

      // 6. Fund escrow
      console.log("💰 Step 4: Funding escrow...");
      await fundMultiReleaseEscrow(
        {
          amount: data.total_amount, // Must be a number (not string)
          contractId,
          signer: wallet.publicKey,
        },
        wallet.secretKey
      );
      console.log("✅ Escrow funded");

      // 7. Save project to Supabase
      console.log("💾 Step 5: Saving project to database...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const projectInsert = {
        contractor_id: user.id,
        freelancer_id: data.freelancer_id,
        title: data.title,
        description: data.description,
        total_amount: data.total_amount,
        expected_delivery_date: data.expected_delivery_date,
        status: "active",
        contact_id: contractId, // Save the contract ID
      } as const;

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert(projectInsert as unknown as never)
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project || !('id' in project)) throw new Error('Project creation failed');
      
      const projectId = (project as { id: string }).id;

      // 8. Save milestones
      console.log("📝 Step 6: Saving milestones...");
      const milestonesData = data.milestones.map((m, index) => ({
        project_id: projectId,
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        deadline: m.deadline,
        status: "pending",
        order: index,
      }));

      const { error: milestonesError } = await supabase
        .from("milestones")
        .insert(milestonesData as unknown as never[]);

      if (milestonesError) throw milestonesError;

      console.log("✅ Project created successfully!");
      setIsLoading(false);
      return { success: true, project, contractId };
    } catch (err: unknown) {
      console.error("❌ Error creating project:", err);
      
      // Log detailed error information from API
      const error = err as { response?: { status: number; data?: { message?: string }; headers?: unknown }; message?: string };
      if (error.response) {
        console.error("📛 API Response Status:", error.response.status);
        console.error("📛 API Response Data:", JSON.stringify(error.response.data, null, 2));
        console.error("📛 API Response Headers:", error.response.headers);
      }
      
      const errorMsg = error.response?.data?.message || error.message || "Failed to create project";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return { createProjectWithEscrow, isLoading, error };
};
