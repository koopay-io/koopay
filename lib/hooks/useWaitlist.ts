"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

interface UseWaitlistReturn {
	joinWaitlist: (
		email: string,
	) => Promise<{ success: boolean; error?: string }>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

/**
 * Hook to handle waitlist signups with improved error handling
 */
export const useWaitlist = (): UseWaitlistReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const supabase = createClient();
	const { showError, showSuccess, showNetworkError } = useErrorToast();

	/**
	 * Basic email validation regex
	 */
	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email.trim());
	};

	/**
	 * Join the waitlist by inserting email into Supabase
	 */
	const joinWaitlist = async (
		email: string,
	): Promise<{ success: boolean; error?: string }> => {
		// Reset states
		setError(null);
		setSuccess(false);
		setIsLoading(true);

		try {
			// Trim and validate email
			const trimmedEmail = email.trim().toLowerCase();

			if (!trimmedEmail) {
				const errorMsg = "Please enter your email address";
				setError(errorMsg);
				showError({ message: errorMsg }, "Email Required");
				setIsLoading(false);
				return { success: false, error: errorMsg };
			}

			if (!isValidEmail(trimmedEmail)) {
				const errorMsg = "Please enter a valid email address";
				setError(errorMsg);
				showError({ message: errorMsg }, "Invalid Email");
				setIsLoading(false);
				return { success: false, error: errorMsg };
			}

			// Insert into waitlist table
			const { error: insertError } = await supabase
				.from("waitlist")
				.insert({ email: trimmedEmail });

			if (insertError) {
				// Check if it's a duplicate email error
				if (
					insertError.code === "23505" ||
					insertError.message.includes("unique")
				) {
					const errorMsg =
						"This email is already on the waitlist. We'll notify you when we launch!";
					setError(errorMsg);
					showError({ message: errorMsg }, "Already Registered");
					setIsLoading(false);
					return { success: false, error: errorMsg };
				}

				// Permission errors
				if (insertError.message.includes("permission")) {
					const errorMsg =
						"Unable to join waitlist. Please contact support.";
					setError(errorMsg);
					showError({ message: errorMsg }, "Access Denied");
					setIsLoading(false);
					return { success: false, error: errorMsg };
				}

				// Other database errors
				logError(insertError, "Join Waitlist");
				const errorMsg = "Failed to join waitlist. Please try again.";
				setError(errorMsg);
				showError(insertError, "Waitlist Error");
				setIsLoading(false);
				return { success: false, error: errorMsg };
			}

			// Success
			setSuccess(true);
			showSuccess(
				"Welcome to the Waitlist!",
				`We'll notify you at ${trimmedEmail} when we launch`,
			);
			setIsLoading(false);
			return { success: true };
		} catch (err) {
			logError(err, "Join Waitlist");
			const errorMsg =
				err instanceof Error ? err.message : "An unexpected error occurred";
			setError(errorMsg);

			if (isNetworkError(err)) {
				showNetworkError(() => joinWaitlist(email));
			} else {
				showError(err, "Failed to Join Waitlist");
			}

			setIsLoading(false);
			return { success: false, error: errorMsg };
		}
	};

	return {
		joinWaitlist,
		isLoading,
		error,
		success,
	};
};
