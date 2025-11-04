'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldPath, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { TOrganizationInsert } from '@/lib/supabase/types/domain/organizations';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Stepper } from './stepper';

const createStep2Schema = (isIndividual: boolean) => {
  if (isIndividual) {
    return z.object({
      legal_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(200, 'Name must not exceed 200 characters'),
      legal_id: z
        .string()
        .min(3, 'ID must be at least 3 characters')
        .max(100, 'ID must not exceed 100 characters'),
      legal_phone: z
        .string()
        .refine(
          (val) => !val || (val.length >= 10 && val.length <= 20),
          'Phone number must be between 10 and 20 characters'
        )
        .optional()
        .nullable(),
    });
  }
  return z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name must not exceed 200 characters'),
    legal_name: z
      .string()
      .min(2, 'Legal name must be at least 2 characters')
      .max(200, 'Legal name must not exceed 200 characters'),
    legal_id: z
      .string()
      .min(3, 'Business ID must be at least 3 characters')
      .max(100, 'Business ID must not exceed 100 characters'),
    legal_phone: z
      .string()
      .refine(
        (val) => !val || (val.length >= 10 && val.length <= 20),
        'Phone number must be between 10 and 20 characters'
      )
      .optional()
      .nullable(),
  });
};

export function Step2() {
  const router = useRouter();
  const { data, updateData, setMaxStepReached, organizationType } = useOnboardingContext();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(data.avatarFile || null);

  useEffect(() => {
    if (data.avatarFile && !avatarPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(data.avatarFile);
    }
  }, [data.avatarFile, avatarPreview]);

  const isIndividual = data.legal_type === 'individual';
  const isProvider = organizationType === 'provider';
  const schema = createStep2Schema(isIndividual);

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (isIndividual) {
      reset({
        legal_name: data.legal_name,
        legal_id: data.legal_id,
        legal_phone: data.legal_phone || undefined,
      } as FormData);
    } else {
      reset({
        name: data.name,
        legal_name: data.legal_name,
        legal_id: data.legal_id,
        legal_phone: data.legal_phone || undefined,
      } as FormData);
    }
  }, [isIndividual, data.name, data.legal_name, data.legal_id, data.legal_phone, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must not exceed 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    setAvatarFile(file);
    updateData({ avatarFile: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (formData: FormData) => {
    const baseData: Partial<Pick<TOrganizationInsert, 'legal_name' | 'legal_id' | 'legal_phone'>> =
      {
        legal_name: formData.legal_name,
        legal_id: formData.legal_id,
        legal_phone: formData.legal_phone || null,
      };

    let finalData: Partial<
      Pick<TOrganizationInsert, 'name' | 'legal_name' | 'legal_id' | 'legal_phone'>
    >;

    if (isIndividual) {
      finalData = {
        ...baseData,
        name: `${formData.legal_name}'s Org`,
      };
    } else {
      const companyFormData = formData as {
        name: string;
        legal_name: string;
        legal_id: string;
        legal_phone?: string | null;
      };
      finalData = {
        ...baseData,
        name: companyFormData.name,
      };
    }

    if (avatarFile) {
      updateData({
        ...finalData,
        avatarFile,
      });
    } else {
      updateData(finalData);
    }

    setMaxStepReached(3);
    router.push('/onboarding?step=3');
  };

  const handleBack = () => {
    router.push('/onboarding?step=1');
  };

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={2} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">
        Personal Information
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          <div className="flex-shrink-0">
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <label htmlFor="avatar" className="cursor-pointer block mt-2 touch-manipulation">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border hover:border-primary active:border-primary/70 transition-colors rounded-full">
                {avatarPreview ? <AvatarImage src={avatarPreview} alt="Avatar preview" /> : null}
                <AvatarFallback className="bg-card">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/40" />
                </AvatarFallback>
              </Avatar>
            </label>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <label htmlFor="avatar" className="cursor-pointer touch-manipulation">
              {isIndividual && (
                <p className="text-foreground/60 text-sm hover:text-foreground/80 active:text-foreground transition-colors">
                  Add a profile picture to help others recognize you
                </p>
              )}
              {!isIndividual && (
                <p className="text-foreground/60 text-sm hover:text-foreground/80 active:text-foreground transition-colors">
                  Add a logo to help others recognize your company
                </p>
              )}
            </label>
          </div>
        </div>

        {!isIndividual && (
          <div>
            <Label htmlFor="name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name' as FieldPath<FormData>)}
              placeholder={isProvider ? 'e.g., Creative Design Studio' : 'e.g., Tech Solutions'}
              autoComplete="organization"
              className="mt-2"
            />
            {(() => {
              if (!isIndividual && 'name' in errors && errors.name) {
                const nameError = errors.name;
                if (typeof nameError === 'object' && nameError !== null && 'message' in nameError) {
                  return (
                    <p className="text-destructive text-sm mt-1">{String(nameError.message)}</p>
                  );
                }
              }
              return null;
            })()}
          </div>
        )}

        <div>
          <Label htmlFor="legal_name">
            {isIndividual ? 'Full Name' : 'Legal Company Name'}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_name"
            {...register('legal_name')}
            placeholder={isIndividual ? 'e.g., John Smith' : 'e.g., Tech Solutions LLC'}
            autoComplete={isIndividual ? 'name' : 'organization'}
            className="mt-2"
          />
          {errors.legal_name && (
            <p className="text-destructive text-sm mt-1">{errors.legal_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_id">
            {isIndividual ? 'Your ID Number' : 'Your Business ID Number'}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_id"
            {...register('legal_id')}
            placeholder={
              isIndividual
                ? 'e.g., 123-45-6789 or your national ID'
                : 'e.g., 12-3456789 or business registration number'
            }
            autoComplete={isIndividual ? 'off' : 'organization'}
            className="mt-2"
          />
          {errors.legal_id && (
            <p className="text-destructive text-sm mt-1">{errors.legal_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_phone">{isIndividual ? 'Your Phone' : 'Your Business Phone'}</Label>
          <Input
            id="legal_phone"
            type="tel"
            {...register('legal_phone')}
            placeholder={isIndividual ? 'e.g., +1 (555) 123-4567' : 'e.g., +1 (555) 123-4567'}
            autoComplete="tel"
            className="mt-2"
          />
          {errors.legal_phone && (
            <p className="text-destructive text-sm mt-1">{errors.legal_phone.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 sm:pt-6">
          <Button type="submit" className="gap-2 w-full sm:w-auto bg-gradient-1">
            Next
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </form>
    </>
  );
}
