'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';

interface OnboardingErrorProps {
  error: string;
}

export function OnboardingError({ error }: OnboardingErrorProps) {
  const router = useRouter();
  const { clearCompletionError } = useOnboardingContext();

  const handleBackToOnboarding = () => {
    clearCompletionError();
    router.push('/onboarding');
  };

  return (
    <div className="text-center min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-foreground mb-6 text-sm sm:text-base">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleBackToOnboarding}
            className="w-full sm:w-auto"
          >
            Back to onboarding
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `mailto:salinatomass53@gmail.com?subject=Onboarding Error&body=${encodeURIComponent(error)}`;
            }}
            className="w-full sm:w-auto gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Development
          </Button>
        </div>
      </div>
    </div>
  );
}

