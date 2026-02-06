"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import { tw } from "@/lib/tw";
import { getUserStellarWallet } from "@/lib/actions/wallet";
import { revalidatePath } from "next/cache";
import { USDC_TRUSTLINE } from "@/lib/constants";

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_TRUSTLESS_ADMIN_PK ?? "";
const PLATFORM_FEE = Number(
  process.env.NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE || "1.5",
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Step 1 — Prepare: validate, fetch freelancer wallet, get unsigned XDR
// ---------------------------------------------------------------------------

export async function prepareProjectCreation(
  data: CreateProjectInput,
  userPublicKey: string,
): Promise<ActionResult<{ unsignedTransaction: string }>> {
  if (!PLATFORM_ADDRESS) {
    return {
      success: false,
      error: "Platform address not configured (NEXT_PUBLIC_TRUSTLESS_ADMIN_PK)",
    };
  }

  // 1. Validate input
  const validation = createProjectSchema.safeParse(data);
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstError };
  }
  const projectData = validation.data;

  // 2. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 3. Determine collaborator wallet address
  let freelancerWallet = "";

  if (projectData.freelancer_address) {
    freelancerWallet = projectData.freelancer_address;
  } else if (projectData.freelancer_id) {
    const walletFromDb = await getUserStellarWallet(projectData.freelancer_id);
    if (!walletFromDb) {
      return {
        success: false,
        error: "Selected collaborator has not set up their wallet.",
      };
    }
    freelancerWallet = walletFromDb;
  } else {
    return { success: false, error: "No collaborator assigned" };
  }

  // 4. Build Trustless Work payload
  const payload = {
    signer: userPublicKey,
    engagementId: `koopay-${Date.now()}`,
    title: projectData.title,
    description: projectData.description,
    platformFee: PLATFORM_FEE,
    milestones: projectData.milestones.map((m) => ({
      description: m.title,
      amount: Number(
        (projectData.total_amount * (m.percentage / 100)).toFixed(7),
      ),
      // Receiver is correctly defined here per milestone
      receiver: freelancerWallet,
    })),
    trustline: {
      address: USDC_TRUSTLINE,
      symbol: "USDC",
    },
    roles: {
      approver: userPublicKey,
      releaseSigner: userPublicKey,
      serviceProvider: freelancerWallet,
      // REMOVED: receiver (Not allowed in Roles schema)
      platformAddress: PLATFORM_ADDRESS,
      disputeResolver: PLATFORM_ADDRESS,
    },
    // REMOVED: receiverMemo (Not allowed in Root schema)
  };

  // 5. Call Trustless Work API
  try {
    const response = await tw.post("/deployer/multi-release", payload);
    const unsignedTransaction: string | undefined =
      response.data?.unsignedTransaction;

    if (!unsignedTransaction) {
      return {
        success: false,
        error: "Failed to generate transaction from Trustless Work",
      };
    }

    return { success: true, unsignedTransaction };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string; details?: unknown } };
      message?: string;
    };

    // Improved logging to see validation details in terminal
    console.error(
      "TW API Error:",
      JSON.stringify(
        axiosError?.response?.data || axiosError?.message,
        null,
        2,
      ),
    );

    return { success: false, error: "Failed to prepare escrow contract." };
  }
}

// ---------------------------------------------------------------------------
// Step 2 — Finalize: submit signed TX, persist to DB
// ---------------------------------------------------------------------------

export async function finalizeProjectCreation(
  signedXdr: string,
  projectData: CreateProjectInput,
): Promise<ActionResult<{ projectId: string }>> {
  if (!PLATFORM_ADDRESS) {
    return {
      success: false,
      error: "Platform address not configured (NEXT_PUBLIC_TRUSTLESS_ADMIN_PK)",
    };
  }

  const validation = createProjectSchema.safeParse(projectData);
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstError };
  }
  const validatedProjectData = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  let contractId = "";

  // 1. Submit signed transaction to Stellar via Trustless Work
  try {
    const sendRes = await tw.post("/helper/send-transaction", { signedXdr });

    contractId =
      sendRes.data?.contractId ?? sendRes.data?.escrow?.contractId ?? "";

    if (!contractId) {
      console.error("TX response missing contractId:", sendRes.data);
      return {
        success: false,
        error: "Transaction submitted but no contract ID returned.",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    console.error(
      "TX Submission Error:",
      axiosError?.response?.data ?? axiosError?.message,
    );
    return {
      success: false,
      error: "Failed to submit transaction to the Stellar network.",
    };
  }

  // 2. Persist project + milestones to the database
  try {
    // Insert project
    const { data: project, error: projError } = await supabase
      .from("projects")
      .insert({
        contractor_id: user.id,
        freelancer_id: validatedProjectData.freelancer_id ?? null,
        freelancer_address: validatedProjectData.freelancer_address ?? null,
        title: validatedProjectData.title,
        description: validatedProjectData.description,
        total_amount: validatedProjectData.total_amount,
        expected_delivery_date: validatedProjectData.expected_delivery_date,
        status: "active" as const,
        contract_id: contractId,
      })
      .select()
      .single();

    if (projError || !project) {
      throw new Error(projError?.message ?? "Project insert failed");
    }

    // Insert milestones
    const baseTime = Date.now();
    const milestonesInsert = validatedProjectData.milestones.map((m, i) => ({
      project_id: project.id,
      title: m.title,
      description: m.description,
      percentage: m.percentage,
      status: "pending" as const,
      created_at: new Date(baseTime + i * 1000).toISOString(),
    }));

    const { error: mileError } = await supabase
      .from("milestones")
      .insert(milestonesInsert);

    if (mileError) {
      throw new Error(mileError.message);
    }

    revalidatePath("/projects");

    return { success: true, projectId: project.id };
  } catch (dbError: unknown) {
    const message =
      dbError instanceof Error ? dbError.message : "Unknown database error";
    console.error("DB Error:", message);
    return {
      success: false,
      error: `Escrow deployed but failed to save project data. Contact support with Contract ID: ${contractId}`,
    };
  }
}
