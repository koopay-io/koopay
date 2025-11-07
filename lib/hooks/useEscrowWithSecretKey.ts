"use client";

import { 
  useInitializeEscrow, 
  useFundEscrow, 
  useSendTransaction,
  useApproveMilestone,
  useChangeMilestoneStatus
} from "@trustless-work/escrow/hooks";
import { Keypair, Transaction, Networks } from "@stellar/stellar-sdk";
import type { 
  InitializeMultiReleaseEscrowPayload, 
  FundEscrowPayload,
  InitializeMultiReleaseEscrowResponse,
  ApproveMilestonePayload,
  ChangeMilestoneStatusPayload
} from "@trustless-work/escrow/types";

/**
 * Helper function to sign Stellar transactions with a secret key
 * Uses the Stellar SDK instead of Wallet Kit for invisible wallet integration
 * 
 * @param unsignedTxXdr - The unsigned transaction XDR string
 * @param secretKey - The Stellar secret key to sign with
 * @returns The signed transaction XDR string
 */
const signTransactionWithSecretKey = (unsignedTxXdr: string, secretKey: string): string => {
  const keypair = Keypair.fromSecret(secretKey);
  const transaction = new Transaction(unsignedTxXdr, Networks.TESTNET);
  transaction.sign(keypair);
  return transaction.toXDR();
};

/**
 * Custom hook for deploying and funding Trustless Work escrows
 * using secret keys from invisible wallets created with the Stellar SDK
 * 
 * This hook bypasses the need for Stellar Wallet Kit by signing
 * transactions programmatically with secret keys stored in the app
 */
export const useEscrowWithSecretKey = () => {
  const { deployEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();
  const { approveMilestone } = useApproveMilestone();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();

  /**
   * Deploy a multi-release escrow contract
   * 
   * @param payload - The escrow initialization payload
   * @param contractorSecretKey - The contractor's Stellar secret key
   * @returns The deployment result with contractId
   */
  const deployMultiReleaseEscrow = async (
    payload: InitializeMultiReleaseEscrowPayload,
    contractorSecretKey: string
  ): Promise<InitializeMultiReleaseEscrowResponse> => {
    try {
      console.log("🔧 [Deploy Step 1/3] Calling deployEscrow API...");
      
      // 1. Deploy escrow (generates unsigned transaction)
      const unsignedTxResponse = await deployEscrow(payload, "multi-release");
      const unsignedTx = typeof unsignedTxResponse === 'string' 
        ? unsignedTxResponse 
        : (unsignedTxResponse as { unsignedTx?: string; transaction?: string }).unsignedTx || 
          (unsignedTxResponse as { transaction?: string }).transaction || 
          String(unsignedTxResponse);
      console.log("✅ [Deploy Step 1/3] Unsigned transaction received");
      console.log("📄 Unsigned TX length:", unsignedTx.length);
      
      // 2. Sign with secret key from SDK
      console.log("🔧 [Deploy Step 2/3] Signing transaction with secret key...");
      const signedTx = signTransactionWithSecretKey(unsignedTx, contractorSecretKey);
      console.log("✅ [Deploy Step 2/3] Transaction signed successfully");
      
      // 3. Send signed transaction
      console.log("🔧 [Deploy Step 3/3] Sending signed transaction to network...");
      const result = await sendTransaction(signedTx);
      console.log("✅ [Deploy Step 3/3] Transaction submitted successfully");
      console.log("🎉 Deployment result:", result);
      
      return result as InitializeMultiReleaseEscrowResponse;
    } catch (error) {
      console.error("❌ [Deploy Error] Failed at some step:");
      console.error("Error details:", error);
      throw error;
    }
  };

  /**
   * Fund a multi-release escrow contract
   * 
   * @param payload - The escrow funding payload
   * @param contractorSecretKey - The contractor's Stellar secret key
   * @returns The funding result
   */
  const fundMultiReleaseEscrow = async (
    payload: FundEscrowPayload,
    contractorSecretKey: string
  ) => {
    const unsignedTxResponse = await fundEscrow(payload, "multi-release");
    const unsignedTx = typeof unsignedTxResponse === 'string' 
      ? unsignedTxResponse 
      : (unsignedTxResponse as { unsignedTx?: string; transaction?: string }).unsignedTx || 
        (unsignedTxResponse as { transaction?: string }).transaction || 
        String(unsignedTxResponse);
    const signedTx = signTransactionWithSecretKey(unsignedTx, contractorSecretKey);
    const result = await sendTransaction(signedTx);
    return result;
  };

  /**
   * Approve a milestone in a multi-release escrow contract
   * 
   * @param payload - The milestone approval payload
   * @param approverSecretKey - The approver's Stellar secret key
   * @returns The approval result
   */
  const approveMilestoneInEscrow = async (
    payload: ApproveMilestonePayload,
    approverSecretKey: string
  ) => {
    try {
      console.log("🔧 [Approve Milestone Step 1/3] Calling approveMilestone API...");
      
      // 1. Get unsigned transaction
      // According to docs: const { unsignedTransaction } = await approveMilestone(payload);
      const response = await approveMilestone(payload, "multi-release");
      const unsignedTx = typeof response === 'string' 
        ? response 
        : (response as { unsignedTransaction?: string }).unsignedTransaction ||
          (response as { unsignedTx?: string }).unsignedTx || 
          (response as { transaction?: string }).transaction || 
          String(response);
      
      if (!unsignedTx) {
        throw new Error("Unsigned transaction is missing from approveMilestone response");
      }
      
      console.log("✅ [Approve Milestone Step 1/3] Unsigned transaction received");
      
      // 2. Sign with secret key
      console.log("🔧 [Approve Milestone Step 2/3] Signing transaction with secret key...");
      const signedTx = signTransactionWithSecretKey(unsignedTx, approverSecretKey);
      console.log("✅ [Approve Milestone Step 2/3] Transaction signed successfully");
      
      // 3. Send signed transaction
      console.log("🔧 [Approve Milestone Step 3/3] Sending signed transaction to network...");
      const result = await sendTransaction(signedTx);
      console.log("✅ [Approve Milestone Step 3/3] Transaction submitted successfully");
      console.log("🎉 Milestone approval result:", result);
      
      return result;
    } catch (error) {
      console.error("❌ [Approve Milestone Error] Failed at some step:");
      console.error("Error details:", error);
      throw error;
    }
  };

  /**
   * Change the status of a milestone in a multi-release escrow contract
   * 
   * @param payload - The milestone status change payload
   * @param serviceProviderSecretKey - The service provider's Stellar secret key
   * @returns The status change result
   */
  const changeMilestoneStatusInEscrow = async (
    payload: ChangeMilestoneStatusPayload,
    serviceProviderSecretKey: string
  ) => {
    try {
      console.log("🔧 [Change Milestone Status Step 1/3] Calling changeMilestoneStatus API...");
      
      // 1. Get unsigned transaction
      const response = await changeMilestoneStatus(payload, "multi-release");
      const unsignedTx = typeof response === 'string' 
        ? response 
        : (response as { unsignedTransaction?: string }).unsignedTransaction ||
          (response as { unsignedTx?: string }).unsignedTx || 
          (response as { transaction?: string }).transaction || 
          String(response);
      
      if (!unsignedTx) {
        throw new Error("Unsigned transaction is missing from changeMilestoneStatus response");
      }
      
      console.log("✅ [Change Milestone Status Step 1/3] Unsigned transaction received");
      
      // 2. Sign with secret key
      console.log("🔧 [Change Milestone Status Step 2/3] Signing transaction with secret key...");
      const signedTx = signTransactionWithSecretKey(unsignedTx, serviceProviderSecretKey);
      console.log("✅ [Change Milestone Status Step 2/3] Transaction signed successfully");
      
      // 3. Send signed transaction
      console.log("🔧 [Change Milestone Status Step 3/3] Sending signed transaction to network...");
      const result = await sendTransaction(signedTx);
      console.log("✅ [Change Milestone Status Step 3/3] Transaction submitted successfully");
      console.log("🎉 Milestone status change result:", result);
      
      return result;
    } catch (error) {
      console.error("❌ [Change Milestone Status Error] Failed at some step:");
      console.error("Error details:", error);
      throw error;
    }
  };

  return {
    deployMultiReleaseEscrow,
    fundMultiReleaseEscrow,
    approveMilestoneInEscrow,
    changeMilestoneStatusInEscrow,
  };
};




