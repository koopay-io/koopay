import { Keypair, Networks, Transaction } from "@stellar/stellar-sdk";
import { http } from "./http";
import { StellarWallet } from "./wallet";
import { USDC_TRUSLINE } from "../constants";

interface ProjectMilestone {
  title: string;
  description: string;
  percentage: number;
  deadline: string;
}

export interface ProjectData {
  title: string;
  description: string;
  total_amount: number;
  milestones: ProjectMilestone[];
}

export async function createEscrow(
  wallet: StellarWallet,
  projectData: ProjectData,
  collaboratorPublicKey: string,
) {
  const signerPublicKey = wallet.publicKey;

  // Calculate platform fee from environment or default to 1.5
  const platformFee = Number(
    process.env.NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE || "1.5",
  );

  // Map milestones with the correct 'receiver' (Freelancer)
  const apiMilestones = projectData.milestones.map((milestone) => ({
    description: milestone.title,
    // Ensure amount is a number and calculated correctly
    amount: Number(
      (projectData.total_amount * (milestone.percentage / 100)).toFixed(7),
    ),
    receiver: collaboratorPublicKey,
  }));

  // Generate a unique 6-digit memo for the receiver
  const receiverMemo = Date.now() % 1000000;

  const response = await http.post("/deployer/multi-release", {
    signer: signerPublicKey,
    engagementId: `project-${Date.now()}`,
    title: projectData.title,
    description: projectData.description,
    roles: {
      approver: signerPublicKey,
      serviceProvider: collaboratorPublicKey,
      platformAddress: signerPublicKey, // In prod, this should be the Admin PK
      releaseSigner: signerPublicKey, //
      disputeResolver: signerPublicKey,
    },
    platformFee: platformFee,
    milestones: apiMilestones,
    trustline: {
      address: USDC_TRUSLINE,
      symbol: "USDC",
    },
    receiverMemo: receiverMemo,
  });

  return response.data;
}

export const signTransactionWithSk = (
  unsignedTxXdr: string,
  secretKey: string,
): string => {
  const keypair = Keypair.fromSecret(secretKey);
  const transaction = new Transaction(unsignedTxXdr, Networks.TESTNET);
  transaction.sign(keypair);
  return transaction.toXDR();
};
