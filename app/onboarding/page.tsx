'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrganizationTypeSelector } from './_components/OrganizationTypeSelector';
import { Step1 } from './_components/Step1';
import { Step2 } from './_components/Step2';
import { Step3 } from './_components/Step3';
import { Step4 } from './_components/Step4';
import { OnboardingError } from './_components/OnboardingError';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step');
  const { organizationType, data, setMaxStepReached, completionError, clearCompletionError } = useOnboardingContext();

  useEffect(() => {
    const stepNum = step ? parseInt(step) : 0;
    if (stepNum > 0 && stepNum <= 4) {
      setMaxStepReached(stepNum);
    }
  }, [step, setMaxStepReached]);

  useEffect(() => {
    if (step && step !== 'complete' && completionError) {
      clearCompletionError();
    }
  }, [step, completionError, clearCompletionError]);

  const renderStep = () => {
    if (completionError) {
      return <OnboardingError error={completionError} />;
    }

    if (!step) {
      return <OrganizationTypeSelector />;
    }

    if (!organizationType && step !== '1') {
      return <OrganizationTypeSelector />;
    }

    switch (step) {
      case '1':
        if (!organizationType) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step1 />
            </div>
          </div>
        );

      case '2':
        if (!data.legal_type) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step2 />
            </div>
          </div>
        );

      case '3':
        if (!data.legal_type) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step3 />
            </div>
          </div>
        );

      case '4':
        if (!data.legal_type) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step4 />
            </div>
          </div>
        );

      default:
        return <OrganizationTypeSelector />;
    }
  };

  return <>{renderStep()}</>;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}