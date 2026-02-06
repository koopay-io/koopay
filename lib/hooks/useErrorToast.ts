import { toast } from "sonner";
import { useCallback } from "react";
import {
	parseStellarError,
	parseAPIError,
	extractTransactionHash,
} from "../utils/errorHelpers";

export function useErrorToast() {
	/**
	 * Show error toast with appropriate message
	 */
	const showError = useCallback((error: unknown, context?: string) => {
		const message = parseStellarError(error);
		const hash = extractTransactionHash(error);

		toast.error(context || "Error", {
			description: message,
			action: hash
				? {
						label: "View Transaction",
						onClick: () =>
							window.open(
								`https://stellar.expert/explorer/testnet/tx/${hash}`,
								"_blank",
							),
					}
				: undefined,
		});
	}, []);

	/**
	 * Show API error toast
	 */
	const showAPIError = useCallback((error: unknown, context?: string) => {
		const message = parseAPIError(error);

		toast.error(context || "Error", {
			description: message,
		});
	}, []);

	/**
	 * Show network error with retry option
	 */
	const showNetworkError = useCallback((onRetry?: () => void) => {
		toast.error("Connection Error", {
			description:
				"Unable to connect. Please check your internet connection.",
			action: onRetry
				? {
						label: "Retry",
						onClick: onRetry,
					}
				: undefined,
		});
	}, []);

	/**
	 * Show success toast
	 */
	const showSuccess = useCallback((message: string, description?: string) => {
		toast.success(message, {
			description,
		});
	}, []);

	return {
		showError,
		showAPIError,
		showNetworkError,
		showSuccess,
	};
}
