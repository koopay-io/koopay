'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseWaitlistReturn {
  joinWaitlist: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook to handle waitlist signups
 * Validates email and inserts into Supabase waitlist table
 */
export const useWaitlist = (): UseWaitlistReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

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
  const joinWaitlist = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // Reset states
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Trim and validate email
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        const errorMsg = 'Please enter your email address';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      if (!isValidEmail(trimmedEmail)) {
        const errorMsg = 'Please enter a valid email address';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      // Insert into waitlist table
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({ email: trimmedEmail });

      if (insertError) {
        // Check if it's a duplicate email error
        if (insertError.code === '23505' || insertError.message.includes('unique')) {
          const errorMsg = 'This email is already on the waitlist';
          setError(errorMsg);
          setIsLoading(false);
          return { success: false, error: errorMsg };
        }

        // Other database errors
        const errorMsg = insertError.message || 'Failed to join waitlist. Please try again.';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      // Success
      setSuccess(true);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
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

