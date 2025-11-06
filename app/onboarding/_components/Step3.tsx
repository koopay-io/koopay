'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { zSupabaseId } from '@/lib/validations/shared/base';
import { Stepper } from './Stepper';

const step3Schema = z.object({
  legal_country_id: z.number().int().positive('You must select a country'),
  legal_state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),
  legal_city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  legal_street_name: z
    .string()
    .min(2, 'Street name must be at least 2 characters')
    .max(200, 'Street name must not exceed 200 characters'),
  legal_street_number: z
    .number()
    .int()
    .positive('Street number must be positive')
    .min(1, 'Street number must be at least 1')
    .max(999999, 'Street number must not exceed 999999'),
  legal_postal_code: z
    .string()
    .min(4, 'Postal code must be at least 4 characters')
    .max(12, 'Postal code must not exceed 12 characters'),
  legal_suite: z
    .string()
    .refine(
      (val) => !val || (val.length >= 1 && val.length <= 50),
      'Suite must be between 1 and 50 characters if provided'
    )
    .optional()
    .nullable(),
  legal_floor: z
    .string()
    .refine(
      (val) => !val || (val.length >= 1 && val.length <= 50),
      'Floor must be between 1 and 50 characters if provided'
    )
    .optional()
    .nullable(),
});

type FormData = z.infer<typeof step3Schema>;

export function Step3() {
  const router = useRouter();
  const { data, updateData, setMaxStepReached, countries } = useOnboardingContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      legal_country_id: data.legal_country_id,
      legal_state: data.legal_state,
      legal_city: data.legal_city,
      legal_street_name: data.legal_street_name,
      legal_street_number: data.legal_street_number,
      legal_postal_code: data.legal_postal_code,
      legal_suite: data.legal_suite || undefined,
      legal_floor: data.legal_floor || undefined,
    },
  });

  const countryIdValue = watch('legal_country_id');

  useEffect(() => {
    reset({
      legal_country_id: data.legal_country_id,
      legal_state: data.legal_state,
      legal_city: data.legal_city,
      legal_street_name: data.legal_street_name,
      legal_street_number: data.legal_street_number,
      legal_postal_code: data.legal_postal_code,
      legal_suite: data.legal_suite || undefined,
      legal_floor: data.legal_floor || undefined,
    });
  }, [
    data.legal_country_id,
    data.legal_state,
    data.legal_city,
    data.legal_street_name,
    data.legal_street_number,
    data.legal_postal_code,
    data.legal_suite,
    data.legal_floor,
    reset,
  ]);

  const onSubmit = (formData: FormData) => {
    updateData(formData);
    setMaxStepReached(4);
    router.push('/onboarding?step=4');
  };

  const handleBack = () => {
    router.push('/onboarding?step=2');
  };

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={3} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">Address</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="legal_country_id">
            Country <span className="text-destructive">*</span>
          </Label>
          <Select
            id="legal_country_id"
            className="mt-2"
            autoComplete="country"
            value={(countryIdValue || data.legal_country_id)?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              if (value && value > 0) {
                const parsedValue = zSupabaseId.parse(value);
                setValue('legal_country_id', parsedValue);
                updateData({ legal_country_id: parsedValue });
              }
            }}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id.toString()}>
                {country.emoji ? `${country.emoji} ` : ''}
                {country.name}
              </option>
            ))}
          </Select>
          {errors.legal_country_id && (
            <p className="text-destructive text-sm mt-1">{errors.legal_country_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_state">
            State/Province <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_state"
            {...register('legal_state')}
            placeholder="e.g., California, Texas, Florida"
            autoComplete="address-level1"
            className="mt-2"
          />
          {errors.legal_state && (
            <p className="text-destructive text-sm mt-1">{errors.legal_state.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_city"
            {...register('legal_city')}
            placeholder="e.g., San Francisco, Austin, Miami"
            autoComplete="address-level2"
            className="mt-2"
          />
          {errors.legal_city && (
            <p className="text-destructive text-sm mt-1">{errors.legal_city.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legal_street_name">
              Street Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legal_street_name"
              {...register('legal_street_name')}
              placeholder="e.g., Main Street, Park Avenue"
              autoComplete="street-address"
              className="mt-2"
            />
            {errors.legal_street_name && (
              <p className="text-destructive text-sm mt-1">{errors.legal_street_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="legal_street_number">
              Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legal_street_number"
              type="number"
              {...register('legal_street_number', { valueAsNumber: true })}
              placeholder="e.g., 123"
              autoComplete="off"
              className="mt-2"
            />
            {errors.legal_street_number && (
              <p className="text-destructive text-sm mt-1">{errors.legal_street_number.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="legal_postal_code">
            Postal Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_postal_code"
            {...register('legal_postal_code')}
            placeholder="e.g., 10001, M5H 2N2, SW1A 1AA"
            autoComplete="postal-code"
            className="mt-2"
          />
          {errors.legal_postal_code && (
            <p className="text-destructive text-sm mt-1">{errors.legal_postal_code.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legal_suite">Suite</Label>
            <Input
              id="legal_suite"
              {...register('legal_suite')}
              placeholder="e.g., Suite 100, Unit 5"
              autoComplete="off"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="legal_floor">Floor</Label>
            <Input
              id="legal_floor"
              {...register('legal_floor')}
              placeholder="e.g., 5th Floor, Floor 10"
              autoComplete="off"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 sm:pt-6">
          <Button type="submit" className="gap-2 w-full sm:w-auto">
            Next
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </form>
    </>
  );
}
