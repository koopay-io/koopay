'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
}

export function Stepper({ currentStep, totalSteps = 4 }: StepperProps) {
  const router = useRouter();
  const { maxStepReached } = useOnboardingContext();

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached && step !== currentStep) {
      router.push(`/onboarding?step=${step}`);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-12 max-w-80">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-1 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
        {currentStep}
      </div>
      <div className="flex gap-1.5 sm:gap-2 flex-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isReached = step <= maxStepReached;
          const isCurrent = step === currentStep;

          return (
            <button
              key={step}
              type="button"
              onClick={() => handleStepClick(step)}
              disabled={isCurrent}
              className={cn(
                'h-2 w-6 sm:w-8 rounded transition-all touch-manipulation flex-1',
                isReached
                  ? isCurrent
                    ? 'bg-gradient-1 cursor-default'
                    : 'bg-gradient-1 hover:bg-gradient-1/80 active:bg-gradient-1/70 cursor-pointer'
                  : 'bg-gradient-1/20 border border-dashed border-primary cursor-not-allowed'
              )}
              aria-label={`Go to step ${step}`}
            />
          );
        })}
      </div>
    </div>
  );
}
