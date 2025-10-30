"use client";

import { useInitializeEscrow, useFundEscrow, useSendTransaction } from "@trustless-work/escrow";
import { Keypair, Transaction, Networks } from "@stellar/stellar-sdk";
import type { 
  InitializeMultiReleaseEscrowPayload, 
  FundEscrowPayload,
  InitializeMultiReleaseEscrowResponse 
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
      const unsignedTx = await deployEscrow(payload, "multi-release");
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
    const unsignedTx = await fundEscrow(payload, "multi-release");
    const signedTx = signTransactionWithSecretKey(unsignedTx, contractorSecretKey);
    const result = await sendTransaction(signedTx);
    return result;
  };

  return {
    deployMultiReleaseEscrow,
    fundMultiReleaseEscrow,
  };
};




