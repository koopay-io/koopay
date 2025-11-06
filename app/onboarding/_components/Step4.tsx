'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import {
  zOrganizationBusinessTypeEnum,
  zOrganizationIndustryTypeEnum,
} from '@/lib/validations/shared/enums';
import { TOrganizationInsert } from '@/lib/validations/organizations';
import { Spinner } from '@/components/ui/spinner';
import { Stepper } from './Stepper';

const step4Schema = z.object({
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(2000, 'Bio must not exceed 2000 characters'),
  business_type: z
    .string()
    .min(1, 'Please select a business type')
    .refine((val) => zOrganizationBusinessTypeEnum.safeParse(val).success, {
      message: 'Please select a business type',
    }),
  custom_business_type: z
    .string()
    .refine(
      (val) => !val || (val.length >= 2 && val.length <= 100),
      'Custom business type must be between 2 and 100 characters if provided'
    )
    .optional()
    .nullable(),
  industry_type: z
    .string()
    .min(1, 'Please select an industry type')
    .refine((val) => zOrganizationIndustryTypeEnum.safeParse(val).success, {
      message: 'Please select an industry type',
    }),
  custom_industry_type: z
    .string()
    .refine(
      (val) => !val || (val.length >= 2 && val.length <= 100),
      'Custom industry type must be between 2 and 100 characters if provided'
    )
    .optional()
    .nullable(),
});

type Step4FormInput = z.infer<typeof step4Schema>;

type Step4FormData = {
  bio: string;
  business_type: z.infer<typeof zOrganizationBusinessTypeEnum>;
  custom_business_type?: string | null;
  industry_type: z.infer<typeof zOrganizationIndustryTypeEnum>;
  custom_industry_type?: string | null;
};

type FormData = Step4FormData;

const businessTypes = [
  { value: 'freelance', label: 'Freelance' },
  { value: 'agency', label: 'Agency' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'creator', label: 'Creator' },
  { value: 'team', label: 'Team' },
  { value: 'company', label: 'Company' },
  { value: 'other', label: 'Other' },
];

const industryTypes = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Web3 / Finance', label: 'Web3 / Finance' },
  { value: 'Design / Creative', label: 'Design / Creative' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Legal Services', label: 'Legal Services' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Health', label: 'Health' },
  { value: 'Media Production', label: 'Media Production' },
  { value: 'Non Profit / Social', label: 'Non Profit / Social' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail / Ecommerce', label: 'Retail / Ecommerce' },
  { value: 'Travel / Hospitality', label: 'Travel / Hospitality' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Other', label: 'Other' },
];

export function Step4() {
  const router = useRouter();
  const { data, updateData, organizationType, isCompleting, completeOnboarding } =
    useOnboardingContext();
  const [showCustomBusiness, setShowCustomBusiness] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  const isIndividual = data.legal_type === 'individual';
  const isProvider = organizationType === 'provider';

  const form = useForm<Step4FormInput>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      bio: data.bio,
      business_type: data.business_type,
      custom_business_type: data.custom_business_type || undefined,
      industry_type: data.industry_type,
      custom_industry_type: data.custom_industry_type || undefined,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    reset({
      bio: data.bio,
      business_type: data.business_type,
      custom_business_type: data.custom_business_type || undefined,
      industry_type: data.industry_type,
      custom_industry_type: data.custom_industry_type || undefined,
    });
  }, [
    data.bio,
    data.business_type,
    data.custom_business_type,
    data.industry_type,
    data.custom_industry_type,
    reset,
  ]);

  const businessType = watch('business_type');
  const industryType = watch('industry_type');

  useEffect(() => {
    setShowCustomBusiness(businessType === 'other');
  }, [businessType]);

  useEffect(() => {
    setShowCustomIndustry(industryType === 'Other');
  }, [industryType]);

  const onSubmit = async (formData: Step4FormInput) => {
    const businessTypeResult = zOrganizationBusinessTypeEnum.safeParse(formData.business_type);
    const industryTypeResult = zOrganizationIndustryTypeEnum.safeParse(formData.industry_type);

    if (!businessTypeResult.success || !industryTypeResult.success) {
      return;
    }

    const validatedData: Partial<
      Pick<
        TOrganizationInsert,
        'bio' | 'business_type' | 'custom_business_type' | 'industry_type' | 'custom_industry_type'
      >
    > = {
      bio: formData.bio,
      business_type: businessTypeResult.data,
      custom_business_type: formData.custom_business_type || null,
      industry_type: industryTypeResult.data,
      custom_industry_type: formData.custom_industry_type || null,
    };
    updateData(validatedData);
    await completeOnboarding(validatedData);
  };

  const handleBack = () => {
    router.push('/onboarding?step=3');
  };

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={4} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">
        Additional Information
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="bio">
            Bio <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder={
              isIndividual
                ? isProvider
                  ? 'e.g., Experienced freelance designer specializing in branding and UI/UX design with 5+ years working with startups and established companies.'
                  : 'e.g., Business owner looking to streamline payments and manage projects efficiently.'
                : isProvider
                ? 'e.g., Leading creative agency specializing in digital marketing and brand development. We work with innovative companies to create compelling visual identities and marketing strategies.'
                : 'e.g., Technology company providing innovative solutions for businesses. We focus on delivering high-quality products and exceptional customer service.'
            }
            rows={5}
            className="mt-2"
          />
          {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <Label htmlFor="business_type">
            Business Type <span className="text-destructive">*</span>
          </Label>
          <Select id="business_type" {...register('business_type')} className="mt-2">
            <option value="">Select your business type</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.business_type && (
            <p className="text-destructive text-sm mt-1">{errors.business_type.message}</p>
          )}
        </div>

        {showCustomBusiness && (
          <div>
            <Label htmlFor="custom_business_type">Specify business type</Label>
            <Input
              id="custom_business_type"
              {...register('custom_business_type')}
              placeholder="e.g., Sole Proprietorship, Partnership, Non-profit"
              className="mt-2"
            />
          </div>
        )}

        <div>
          <Label htmlFor="industry_type">
            Industry <span className="text-destructive">*</span>
          </Label>
          <Select id="industry_type" {...register('industry_type')} className="mt-2">
            <option value="">Select your industry type</option>
            {industryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.industry_type && (
            <p className="text-destructive text-sm mt-1">{errors.industry_type.message}</p>
          )}
        </div>

        {showCustomIndustry && (
          <div>
            <Label htmlFor="custom_industry_type">Specify industry type</Label>
            <Input
              id="custom_industry_type"
              {...register('custom_industry_type')}
              placeholder="e.g., Agriculture, Education, Energy"
              className="mt-2"
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8 sm:mt-12">
          <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={isCompleting}>
            {isCompleting ? (
              <>
                <Spinner size="sm" />
                Loading...
              </>
            ) : (
              <>
                Complete
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
