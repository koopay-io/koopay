'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { EOrganizationLegalType } from '@/lib/supabase/types/enums';
import { cn } from '@/lib/utils';
import { Stepper } from './stepper';

export function Step1() {
  const router = useRouter();
  const { organizationType, data, updateData, setMaxStepReached } = useOnboardingContext();

  useEffect(() => {
    if (!data.legal_type) {
      updateData({ legal_type: 'individual' });
    }
  }, [data.legal_type, updateData]);

  const handleSelect = (legalType: EOrganizationLegalType) => {
    updateData({ legal_type: legalType });
  };

  const handleBack = () => {
    router.push('/onboarding');
  };

  const currentLegalType = data.legal_type || 'individual';

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={1} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">
        Are you an individual or a company?
      </h1>

      <div className="space-y-4 sm:space-y-6">
        <button
          onClick={() => handleSelect('individual')}
          className={cn(
            'w-full p-4 sm:p-6 rounded-lg border-2 flex items-center gap-3 sm:gap-4 transition-all touch-manipulation',
            currentLegalType === 'individual'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50 active:border-primary/70'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              currentLegalType === 'individual' ? 'border-primary bg-primary' : 'border-primary'
            )}
          >
            {currentLegalType === 'individual' && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
          <span className="text-foreground text-base sm:text-lg">Individual</span>
        </button>

        <button
          onClick={() => handleSelect('company')}
          className={cn(
            'w-full p-4 sm:p-6 rounded-lg border-2 flex items-center gap-3 sm:gap-4 transition-all touch-manipulation',
            currentLegalType === 'company'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50 active:border-primary/70'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              currentLegalType === 'company' ? 'border-primary bg-primary' : 'border-primary'
            )}
          >
            {currentLegalType === 'company' && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
          <span className="text-foreground text-base sm:text-lg">Company</span>
        </button>
      </div>

      <div className="mt-8 sm:mt-12 flex justify-end gap-4">
        <Button
          onClick={() => {
            setMaxStepReached(2);
            router.push('/onboarding?step=2');
          }}
          className="gap-2 w-full sm:w-auto bg-gradient-1"
        >
          Next
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    </>
  );
}
