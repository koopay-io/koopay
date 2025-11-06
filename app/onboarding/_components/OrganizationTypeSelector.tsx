'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { EOrganizationType } from '@/lib/validations/shared/enums';
import { cn } from '@/lib/utils';

export function OrganizationTypeSelector() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<EOrganizationType | null>(null);
  const { setOrganizationType, setMaxStepReached } = useOnboardingContext();

  const handleContinue = () => {
    if (!selectedType) return;
    setOrganizationType(selectedType);
    setMaxStepReached(1);
    router.push('/onboarding?step=1');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-12">
        <Image
          src="/logo.svg"
          alt="Koopay"
          width={174}
          height={48}
          className="h-10 sm:h-12 w-auto"
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-6 sm:mb-12 px-4">
        How do you want to use Koopay?
      </h1>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-4xl">
        <Card
          className={cn(
            'flex-1 cursor-pointer transition-all duration-300',
            selectedType === 'provider'
              ? 'ring-2 ring-primary bg-card/50'
              : 'bg-card hover:bg-card/80'
          )}
          onClick={() => setSelectedType('provider')}
        >
          <CardContent className="px-4 py-6 sm:px-8 sm:py-8 text-center h-auto flex flex-col justify-center">
            <div className="space-y-4">
              <p className="text-foreground font-semibold text-lg sm:text-2xl">
                I want to receive payments
              </p>
              <Button className="w-full gap-2 bg-gradient-1">
                Provider
                {selectedType === 'provider' && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'flex-1 cursor-pointer transition-all duration-300',
            selectedType === 'requester'
              ? 'ring-2 ring-primary bg-card/50'
              : 'bg-card hover:bg-card/80'
          )}
          onClick={() => setSelectedType('requester')}
        >
          <CardContent className="p-6 sm:p-8 text-center h-auto flex flex-col justify-center">
            <div className="space-y-4">
              <p className="text-foreground font-semibold text-lg sm:text-2xl">
                I want to send payments
              </p>
              <Button className="w-full gap-2 bg-gradient-3">
                Requester
                {selectedType === 'requester' && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          'mt-8 sm:mt-12 w-full max-w-4xl px-4 transition-all duration-300 text-center',
          selectedType ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Button
          onClick={handleContinue}
          className="bg-gradient-1 hover:bg-primary/90 text-white px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
