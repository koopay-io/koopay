import { Keypair, Networks, Transaction } from "@stellar/stellar-sdk";
import { http } from "./http";
import { StellarWallet } from "./wallet";
import { USDC_TRUSLINE, DISPUTE_RESOLVER_ADDRESS } from "../constants";

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

  // Each milestone should pay the service provider (collaborator)
  const apiMilestones = projectData.milestones.map((milestone) => ({
    description: milestone.title,
    amount: projectData.total_amount * (milestone.percentage / 100),
    receiver: collaboratorPublicKey,
  }));

  try {
    const response = await http.post("/deployer/multi-release", {
      signer: signerPublicKey,
      engagementId: `project-${Date.now()}`,
      title: projectData.title,
      description: projectData.description,
      roles: {
        approver: signerPublicKey,
        serviceProvider: collaboratorPublicKey,
        platformAddress: signerPublicKey,
        // According to payload types, the role key is releaseSigner
        releaseSigner: signerPublicKey,
        disputeResolver: DISPUTE_RESOLVER_ADDRESS || signerPublicKey,
      },
      platformFee: 1.5,
      milestones: apiMilestones,
      trustline: {
        address: USDC_TRUSLINE,
      }
    });
    return response.data;
  } catch (e) {
    // Enhance error with server validation messages
    const err = e as { response?: { status?: number; data?: unknown } };
    console.error("TrustlessWork deployer error:", {
      status: err.response?.status,
      data: err.response?.data,
    });
    throw e;
  }
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
