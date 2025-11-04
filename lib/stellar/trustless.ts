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

  const apiMilestones = projectData.milestones.map((milestone) => ({
    description: milestone.title,
    amount: projectData.total_amount * (milestone.percentage / 100),
    receiver: signerPublicKey,
  }));

  const response = await http.post("/deployer/multi-release", {
    signer: signerPublicKey,
    engagementId: "project-1762235815529",
    title: projectData.title,
    description: projectData.description,
    roles: {
      approver: signerPublicKey,
      serviceProvider: collaboratorPublicKey,
      platformAddress: signerPublicKey,
      releaseSigner: signerPublicKey,
      disputeResolver: signerPublicKey,
    },
    platformFee: 1.5,
    milestones: apiMilestones,
    trustline: {
      address: USDC_TRUSLINE,
    },
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
