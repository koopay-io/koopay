"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  StellarWalletManager,
  StellarWallet,
  WalletBalance,
} from "@/lib/stellar/wallet";
import { createClient } from "@/lib/supabase/client";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

export interface UseStellarWalletReturn {
  wallet: StellarWallet | null;
  balance: WalletBalance[];
  isLoading: boolean;
  error: string | null;
  createWallet: (userId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendPayment: (
    destination: string,
    amount: string,
    asset?: string,
  ) => Promise<string | null>;
}

export function useStellarWallet(): UseStellarWalletReturn {
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [balance, setBalance] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletManager = useMemo(() => new StellarWalletManager("testnet"), []);
  const supabase = useMemo(() => createClient(), []);
  const { showError, showSuccess, showNetworkError, showAPIError } =
    useErrorToast();

  const loadWalletFromSupabase = useCallback(async () => {
    try {
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth check failed:", userError.message);
        return;
      }

      if (!user) {
        setWallet(null);
        return;
      }

      // Check if wallet exists in user metadata
      const walletData = user.user_metadata?.stellar_wallet;

      if (walletData) {
        // Only update state if the wallet actually changed to avoid re-renders
        setWallet((prev) =>
          prev?.publicKey === walletData.publicKey ? prev : walletData,
        );
      }
    } catch (err) {
      logError(err, "Load Wallet");
      console.error("Failed to load wallet:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createWallet = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const newWallet = await walletManager.createAndFundWallet(
          userId,
          "google",
        );

        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            stellar_wallet: newWallet,
          },
        });

        if (updateError) throw updateError;

        setWallet(newWallet);
        showSuccess("Wallet Created", `Stellar wallet created successfully`);
      } catch (err: unknown) {
        logError(err, "Create Wallet");
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create wallet";
        setError(errorMessage);
        showError(err, "Failed to Create Wallet");
      } finally {
        setIsLoading(false);
      }
    },
    [walletManager, supabase, showError, showSuccess],
  );

  // FIX 2: Removed toast functions from dependency array here too
  const refreshBalance = useCallback(async () => {
    if (!wallet?.publicKey) return;

    try {
      // Avoid setting global loading state for background balance refreshes
      // setIsLoading(true);
      setError(null);

      const balances = await walletManager.getBalance(wallet.publicKey);
      setBalance(balances);
    } catch (err) {
      console.error("Balance refresh failed:", err);
      // Silent fail is better for background poller
    }
  }, [wallet?.publicKey, walletManager]);

  const sendPayment = useCallback(
    async (
      destination: string,
      amount: string,
      asset: string = "XLM",
    ): Promise<string | null> => {
      if (!wallet?.secretKey) {
        showError({ message: "No wallet secret" }, "Payment Failed");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const txHash = await walletManager.sendPayment(
          wallet.secretKey,
          destination,
          amount,
          asset,
        );

        if (txHash) {
          showSuccess("Payment Sent", `Sent ${amount} ${asset}`);
          await refreshBalance();
        }

        return txHash;
      } catch (err: unknown) {
        logError(err, "Send Payment");
        showError(err, "Payment Failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet?.secretKey, walletManager, refreshBalance, showError, showSuccess],
  );

  // Load wallet ONLY once on mount
  useEffect(() => {
    loadWalletFromSupabase();
  }, [loadWalletFromSupabase]);

  // Refresh balance when wallet public key changes
  useEffect(() => {
    if (wallet?.publicKey) {
      refreshBalance();
    }
  }, [wallet?.publicKey, refreshBalance]);

  return {
    wallet,
    balance,
    isLoading,
    error,
    createWallet,
    refreshBalance,
    sendPayment,
  };
}
