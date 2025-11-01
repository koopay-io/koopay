'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      router.replace('/auth/login');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const getErrorMessage = (error: any): string => {
    if (!error) return 'An error occurred';

    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('email rate limit') || errorMessage.includes('too many requests')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('token has expired') || errorMessage.includes('expired')) {
      return 'The verification code has expired. Please request a new one.';
    }
    if (errorMessage.includes('invalid token') || errorMessage.includes('invalid code')) {
      return 'Invalid verification code. Please check and try again.';
    }
    if (errorMessage.includes('email not confirmed') || errorMessage.includes('unconfirmed')) {
      return 'Please verify your email address first.';
    }
    if (errorMessage.includes('user not found')) {
      return 'No account found with this email address.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (errorMessage.includes('email already confirmed')) {
      return 'This email is already verified. Please use a different authentication method.';
    }

    return errorMessage || 'An error occurred. Please try again.';
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      setOtpSent(true);
      setResendCooldown(60);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      setResendCooldown(60);
      setOtp('');
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      router.push('/onboarding');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      if (errorMessage.includes('expired')) {
        setOtp('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
            include_granted_scopes: 'true',
          },
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email',
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const OAuthButtons = () => (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <p className="text-center text-sm text-muted my-3">or</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-accent text-accent-foreground"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-accent text-accent-foreground mt-2"
        onClick={handleMicrosoftSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="none">
          <path d="M0 0H10.377V10.372H0V0Z" fill="#F25022" />
          <path d="M12.623 0H23V10.372H12.623V0Z" fill="#7FBA00" />
          <path d="M0 12.628H10.377V23H0V12.628Z" fill="#00A4EF" />
          <path d="M12.623 12.628H23V23H12.623V12.628Z" fill="#FFB900" />
        </svg>
        Continue with Microsoft
      </Button>
    </div>
  );

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp('');
    setError(null);
    setResendCooldown(0);
  };

  return (
    <div className={cn('w-full max-w-sm lg:max-w-md flex gap-4 sm:gap-5 md:gap-6')}>
      <Card
        className={`w-full border-none bg-black/10 mix-blend-overlay py-6 px-6 sm:py-8 sm:px-6 md:py-10 md:px-8 lg:py-16 lg:px-16 ${
          otpSent ? 'relative' : ''
        }`}
        style={{
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
        }}
      >
        {otpSent && (
          <button
            type="button"
            onClick={handleChangeEmail}
            className="absolute -top-2 left-6 sm:top-0 sm:left-6 md:top-0 md:left-8 lg:top-10 lg:left-16 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Change email</span>
          </button>
        )}
        <motion.div
          className="lg:hidden mb-4 sm:mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src="/logo.svg"
            alt="Koopay Logo"
            width={174}
            height={48}
            className="w-auto h-auto max-w-[140px] sm:max-w-[160px]"
            priority
          />
        </motion.div>
        <CardHeader className="px-0 pb-3 sm:pb-4 md:pb-5">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl sm:w-auto">
            Nice to see you again
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-3 sm:mt-4 md:mt-5 px-0">
          {!otpSent ? (
            <form onSubmit={handleSendOTP}>
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#101b40] border-0 outline-0 rounded-full px-6 py-5 text-base placeholder:text-white placeholder:font-normal font-bold hover:outline-0 focus-visible:ring-0"
                  />
                </div>
                {error && <p className="text-sm text-destructive break-words">{error}</p>}
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isLoading}
                    className="w-full bg-gradient-1"
                  >
                    {isLoading ? 'Sending code...' : 'Continue'}
                  </Button>
                  <OAuthButtons />
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="grid gap-2">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-10 h-10" />
                        <InputOTPSlot index={1} className="w-10 h-10" />
                        <InputOTPSlot index={2} className="w-10 h-10" />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className="w-10 h-10" />
                        <InputOTPSlot index={4} className="w-10 h-10" />
                        <InputOTPSlot index={5} className="w-10 h-10" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive break-words text-center px-2">{error}</p>
                )}
                <div className="flex flex-col items-center gap-1">
                  {resendCooldown > 0 ? (
                    <p className="text-center text-xs text-muted-foreground">
                      Resend code in {resendCooldown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading || resendCooldown > 0}
                      className="text-xs text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend code
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full"
                  >
                    {isLoading ? 'Verifying...' : 'Verify code'}
                  </Button>
                </div>
                <OAuthButtons />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
