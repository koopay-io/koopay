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
			setIsLoading(true);
			setError(null);

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError) {
				throw new Error("Failed to authenticate. Please sign in again.");
			}

			if (!user) {
				setWallet(null);
				return;
			}

			// Check if wallet exists in user metadata
			const walletData = user.user_metadata?.stellar_wallet;

			if (walletData) {
				setWallet(walletData);
			} else {
				// No wallet found - user needs to create one
				console.log("No wallet found for user");
			}
		} catch (err) {
			logError(err, "Load Wallet");
			const errorMessage =
				err instanceof Error ? err.message : "Failed to load wallet";
			setError(errorMessage);

			if (isNetworkError(err)) {
				showNetworkError(loadWalletFromSupabase);
			} else {
				showAPIError(err, "Failed to Load Wallet");
			}
		} finally {
			setIsLoading(false);
		}
	}, [supabase, showNetworkError, showAPIError]);

	const createWallet = useCallback(
		async (userId: string) => {
			try {
				setIsLoading(true);
				setError(null);

				// Create wallet from Google user data
				const newWallet = await walletManager.createAndFundWallet(
					userId,
					"google",
				);

				// Save wallet to Supabase user metadata
				const { error: updateError } = await supabase.auth.updateUser({
					data: {
						stellar_wallet: newWallet,
					},
				});

				if (updateError) {
					if (updateError.message.includes("permission")) {
						throw new Error(
							"You don't have permission to update your profile. Please contact support.",
						);
					}
					throw new Error(`Failed to save wallet: ${updateError.message}`);
				}

				setWallet(newWallet);
				showSuccess(
					"Wallet Created",
					`Stellar wallet created successfully for public key: ${newWallet.publicKey.slice(0, 8)}...`,
				);
				console.log("✅ Stellar wallet created:", newWallet.publicKey);
			} catch (err: unknown) {
				logError(err, "Create Wallet");
				const errorMessage =
					err instanceof Error ? err.message : "Failed to create wallet";
				setError(errorMessage);

				if (isNetworkError(err)) {
					showNetworkError(() => createWallet(userId));
				} else {
					showError(err, "Failed to Create Wallet");
				}
			} finally {
				setIsLoading(false);
			}
		},
		[walletManager, supabase, showError, showSuccess, showNetworkError],
	);

	const refreshBalance = useCallback(async () => {
		if (!wallet?.publicKey) {
			setError("No wallet available. Please create a wallet first.");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const balances = await walletManager.getBalance(wallet.publicKey);
			setBalance(balances);
		} catch (err) {
			logError(err, "Refresh Balance");
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch balance";
			setError(errorMessage);

			if (isNetworkError(err)) {
				showNetworkError(refreshBalance);
			} else {
				showError(err, "Failed to Fetch Balance");
			}
		} finally {
			setIsLoading(false);
		}
	}, [wallet?.publicKey, walletManager, showError, showNetworkError]);

	const sendPayment = useCallback(
		async (
			destination: string,
			amount: string,
			asset: string = "XLM",
		): Promise<string | null> => {
			if (!wallet?.secretKey) {
				const errorMsg =
					"Wallet secret key not available. Please create a wallet first.";
				setError(errorMsg);
				showError({ message: errorMsg }, "Payment Failed");
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
					showSuccess(
						"Payment Sent",
						`Successfully sent ${amount} ${asset}`,
					);

					// Refresh balance after successful payment
					await refreshBalance();
				}

				return txHash;
			} catch (err: unknown) {
				logError(err, "Send Payment");
				const errorMessage =
					err instanceof Error ? err.message : "Payment failed";
				setError(errorMessage);

				// Handle specific payment errors
				if (errorMessage.includes("insufficient balance")) {
					showError(
						{
							message: `Insufficient ${asset} balance. Please add funds to your wallet.`,
						},
						"Payment Failed",
					);
				} else if (errorMessage.includes("destination")) {
					showError(
						{
							message:
								"Invalid destination address. Please check and try again.",
						},
						"Payment Failed",
					);
				} else if (isNetworkError(err)) {
					showNetworkError(() => sendPayment(destination, amount, asset));
				} else {
					showError(err, "Payment Failed");
				}

				return null;
			} finally {
				setIsLoading(false);
			}
		},
		[
			wallet?.secretKey,
			walletManager,
			refreshBalance,
			showError,
			showSuccess,
			showNetworkError,
		],
	);

	// Load wallet from Supabase on mount
	useEffect(() => {
		loadWalletFromSupabase();
	}, [loadWalletFromSupabase]);

	// Load balance when wallet changes
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
