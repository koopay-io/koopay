/**
 * Parse Stellar SDK errors into user-friendly messages
 */
type ErrorLike = {
	message?: string;
	code?: string;
	response?: {
		status?: number;
		data?: unknown;
	};
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export function parseStellarError(error: unknown): string {
	if (!error) return "An unknown error occurred";
	const err = error as ErrorLike;

	// Network errors
	if (err.message?.includes("Network Error")) {
		return "Network connection failed. Please check your internet connection and try again.";
	}

	// Insufficient balance
	if (err.message?.includes("insufficient balance")) {
		return "Insufficient balance in your wallet. Please add funds and try again.";
	}

	// Transaction failed
	const responseData = err.response?.data;
	if (isRecord(responseData)) {
		const extras = responseData.extras;
		if (isRecord(extras)) {
			const resultCodes = extras.result_codes;
			if (isRecord(resultCodes)) {
				const transaction = resultCodes.transaction;
				if (transaction === "tx_insufficient_balance") {
					return "Insufficient balance to complete this transaction.";
				}
				if (transaction === "tx_failed") {
					return "Transaction failed. Please try again or contact support.";
				}
			}
		}
	}

	// Timeout
	if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
		return "Request timed out. Please try again.";
	}

	// Default fallback
	return err.message || "An unexpected error occurred. Please try again.";
}

/**
 * Parse API errors into user-friendly messages
 */
export function parseAPIError(error: unknown): string {
	if (!error) return "An unknown error occurred";
	const err = error as ErrorLike;

	// Network errors
	if (!err.response) {
		return "Unable to connect to the server. Please check your internet connection.";
	}

	// HTTP status codes
	const status = err.response?.status;
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
	const responseData = err.response?.data;
	if (isRecord(responseData)) {
		const message = responseData.message;
		const errorMessage = responseData.error;
		if (typeof message === "string" && message) return message;
		if (typeof errorMessage === "string" && errorMessage) return errorMessage;
	}

	return "An unexpected error occurred. Please try again.";
}

/**
 * Format error for logging
 */
export function logError(error: unknown, context?: string) {
	const err = error as unknown;
	if (process.env.NODE_ENV === "development") {
		console.error(`[Error${context ? ` - ${context}` : ""}]:`, err);
	}
	// In production, you'd send this to an error tracking service
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
	const err = error as ErrorLike;
	return (
		!err.response ||
		err.message?.includes("Network Error") ||
		err.code === "ECONNABORTED"
	);
}

/**
 * Extract transaction hash from Stellar error
 */
export function extractTransactionHash(error: unknown): string | null {
	const err = error as ErrorLike;
	const responseData = err.response?.data;
	if (!isRecord(responseData)) return null;
	const hash = responseData.hash;
	return typeof hash === "string" ? hash : null;
}
