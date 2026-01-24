/**
 * Parse Stellar SDK errors into user-friendly messages
 */
export function parseStellarError(error: any): string {
	if (!error) return "An unknown error occurred";

	// Network errors
	if (error.message?.includes("Network Error")) {
		return "Network connection failed. Please check your internet connection and try again.";
	}

	// Insufficient balance
	if (error.message?.includes("insufficient balance")) {
		return "Insufficient balance in your wallet. Please add funds and try again.";
	}

	// Transaction failed
	if (error.response?.data?.extras?.result_codes) {
		const codes = error.response.data.extras.result_codes;
		if (codes.transaction === "tx_insufficient_balance") {
			return "Insufficient balance to complete this transaction.";
		}
		if (codes.transaction === "tx_failed") {
			return "Transaction failed. Please try again or contact support.";
		}
	}

	// Timeout
	if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
		return "Request timed out. Please try again.";
	}

	// Default fallback
	return error.message || "An unexpected error occurred. Please try again.";
}

/**
 * Parse API errors into user-friendly messages
 */
export function parseAPIError(error: any): string {
	if (!error) return "An unknown error occurred";

	// Network errors
	if (!error.response) {
		return "Unable to connect to the server. Please check your internet connection.";
	}

	// HTTP status codes
	const status = error.response?.status;
	if (status === 401) {
		return "Authentication failed. Please sign in again.";
	}
	if (status === 403) {
		return "You do not have permission to perform this action.";
	}
	if (status === 404) {
		return "The requested resource was not found.";
	}
	if (status === 500) {
		return "Server error. Please try again later.";
	}

	// API error message
	const message = error.response?.data?.message || error.response?.data?.error;
	if (message) {
		return message;
	}

	return "An unexpected error occurred. Please try again.";
}

/**
 * Format error for logging
 */
export function logError(error: any, context?: string) {
	if (process.env.NODE_ENV === "development") {
		console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
	}
	// In production, you'd send this to an error tracking service
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
	return (
		!error.response ||
		error.message?.includes("Network Error") ||
		error.code === "ECONNABORTED"
	);
}

/**
 * Extract transaction hash from Stellar error
 */
export function extractTransactionHash(error: any): string | null {
	return error.response?.data?.hash || null;
}
