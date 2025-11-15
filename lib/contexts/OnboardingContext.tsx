'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EOrganizationType } from '@/lib/validations/shared/enums';
import { TOrganizationInsert } from '@/lib/validations/organizations';
import { TUserOrganizationInsert } from '@/lib/validations/user_organization';
import { TCountryRow } from '@/lib/validations/countries';
import { User } from '@supabase/supabase-js';

interface OnboardingData extends Partial<Omit<TOrganizationInsert, 'avatar_url'>> {
  avatarFile?: File;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  clearData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  maxStepReached: number;
  setMaxStepReached: (step: number) => void;
  organizationType: EOrganizationType | null;
  setOrganizationType: (type: EOrganizationType | null) => void;
  countries: TCountryRow[];
  user: User | null;
  isCompleting: boolean;
  completionError: string | null;
  completeOnboarding: (finalData?: Partial<OnboardingData>) => Promise<void>;
  clearCompletionError: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
  countries: TCountryRow[];
  user: User | null;
}

export function OnboardingProvider({ children, countries, user }: OnboardingProviderProps) {
  const [data, setData] = useState<OnboardingData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [organizationType, setOrganizationType] = useState<EOrganizationType | null>(null);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => {
      const newType = newData.type !== undefined ? newData.type : prev.type;
      const newLegalType = newData.legal_type !== undefined ? newData.legal_type : prev.legal_type;

      const shouldReset =
        (newType !== undefined && newType !== prev.type) ||
        (newLegalType !== undefined && newLegalType !== prev.legal_type);

      if (shouldReset) {
        return {
          type: newType,
          legal_type: newLegalType,
        } as OnboardingData;
      }

      return { ...prev, ...newData };
    });
  };

  const setOrganizationTypeWithReset = (type: EOrganizationType | null) => {
    setOrganizationType(type);
    if (type !== null) {
      setData(
        (prev) =>
          ({
            type: type,
            legal_type: prev.legal_type,
          } as OnboardingData)
      );
    }
  };

  const clearData = () => {
    setData({});
    setCurrentStep(0);
    setMaxStepReached(0);
    setOrganizationType(null);
    setIsCompleting(false);
    setCompletionError(null);
  };

  const completeOnboarding = async (finalData?: Partial<OnboardingData>) => {
    const mergedData = { ...data, ...finalData };

    if (!organizationType || !mergedData.legal_type) {
      setCompletionError('Missing required information');
      return;
    }

    if (!user) {
      setCompletionError('Could not get authenticated user');
      return;
    }

    if (
      !mergedData.name ||
      !mergedData.legal_name ||
      !mergedData.legal_id ||
      !mergedData.bio ||
      !mergedData.legal_country_id ||
      !mergedData.legal_state ||
      !mergedData.legal_city ||
      !mergedData.legal_street_name ||
      !mergedData.legal_street_number ||
      !mergedData.legal_postal_code ||
      !mergedData.business_type ||
      !mergedData.industry_type
    ) {
      setCompletionError('Please complete all required fields');
      return;
    }

    setIsCompleting(true);
    setCompletionError(null);

    const supabase = createClient();

    try {
      const organizationData = {
        type: organizationType,
        legal_type: mergedData.legal_type,
        name: mergedData.name,
        legal_name: mergedData.legal_name,
        legal_id: mergedData.legal_id,
        legal_phone: mergedData.legal_phone || null,
        bio: mergedData.bio,
        avatar_url: null,
        legal_country_id: mergedData.legal_country_id,
        legal_state: mergedData.legal_state,
        legal_city: mergedData.legal_city,
        legal_street_name: mergedData.legal_street_name,
        legal_street_number: mergedData.legal_street_number,
        legal_postal_code: mergedData.legal_postal_code,
        legal_suite: mergedData.legal_suite || null,
        legal_floor: mergedData.legal_floor || null,
        business_type: mergedData.business_type,
        custom_business_type: mergedData.custom_business_type || null,
        industry_type: mergedData.industry_type,
        custom_industry_type: mergedData.custom_industry_type || null,
        created_by: user.id, // Explicitly set created_by so get_user_organizations RPC can find it
      } as TOrganizationInsert & { created_by: string };

      console.log('=== CREATING ORGANIZATION ===');
      console.log('Organization data:', organizationData);

      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert(organizationData as any)
        .select()
        .single();

      if (orgError || !organization) {
        console.error('Error creating organization:', orgError);
        console.error('Full error:', JSON.stringify(orgError, null, 2));
        setCompletionError('Error creating organization: ' + orgError?.message);
        setIsCompleting(false);
        return;
      }

      console.log('Organization created successfully:', organization);
      const organizationId = (organization as { id: number }).id;
      const createdBy = (organization as { created_by?: string }).created_by;
      console.log('Organization ID:', organizationId);
      console.log('Organization created_by:', createdBy);
      console.log('User ID:', user.id);
      console.log('Created_by matches user.id:', createdBy === user.id);
      
      // Verify created_by was set correctly
      if (createdBy !== user.id) {
        console.error('WARNING: created_by does not match user.id!', {
          createdBy,
          userId: user.id,
          organization
        });
        // Try to update it
        const { error: updateError } = await supabase
          .from('organizations')
          .update({ created_by: user.id })
          .eq('id', organizationId);
        
        if (updateError) {
          console.error('Failed to update created_by:', updateError);
          setCompletionError('Error setting organization creator. Please try again.');
          setIsCompleting(false);
          return;
        }
        console.log('Updated created_by to match user.id');
      }

      console.log('=== CREATING USER_ORGANIZATION ===');
      const userOrganizationData = {
        organization_id: organizationId,
        user_id: user.id,
        email: user.email || '',
        role: 'owner' as const,
        status: 'active' as const,
        joined_at: new Date().toISOString(),
      } satisfies TUserOrganizationInsert;

      console.log('User organization data:', userOrganizationData);
      const { error: userOrgError } = await supabase
        .from('user_organization')
        .insert(userOrganizationData as any);

      if (userOrgError) {
        console.error('Error creating user_organization:', userOrgError);
        console.error('Full error:', JSON.stringify(userOrgError, null, 2));
        setCompletionError('Error associating user with organization: ' + userOrgError.message);
        setIsCompleting(false);
        return;
      }

      console.log('User organization created successfully');

      // Verify that the organization can be retrieved using the RPC function
      // This ensures the database transaction is fully committed and the RPC can find it
      console.log('=== VERIFYING ORGANIZATION CREATION ===');
      
      // Try up to 3 times with a small delay to account for eventual consistency
      let verified = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { data: verifyRpc, error: verifyRpcError } = await supabase.rpc(
            'get_user_organizations',
            { p_user_id: user.id }
          ) as { data: { total: number; organizations: unknown[] } | null; error: unknown };

          if (!verifyRpcError && verifyRpc && verifyRpc.total > 0) {
            const orgs = verifyRpc.organizations;
            const found = orgs.some((org: unknown) => {
              if (typeof org === 'object' && org !== null && 'id' in org) {
                const orgWithId = org as { id?: number };
                return orgWithId.id === organizationId;
              }
              return false;
            });
            
            if (found) {
              console.log(`Organization verified successfully on attempt ${attempt}:`, verifyRpc);
              verified = true;
              break;
            }
          }
          
          if (attempt < 3) {
            console.log(`Verification attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
          }
        } catch (err) {
          console.error(`Error on verification attempt ${attempt}:`, err);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!verified) {
        console.error('Organization verification failed after 3 attempts');
        setCompletionError('Organization created but verification failed. Please refresh the page.');
        setIsCompleting(false);
        return;
      }

      let avatarUrl: string | null = null;

      if (mergedData.avatarFile) {
        console.log('=== UPLOADING AVATAR ===');
        console.log('Avatar file:', mergedData.avatarFile);
        console.log('File name:', mergedData.avatarFile.name);
        console.log('File size:', mergedData.avatarFile.size);
        console.log('File type:', mergedData.avatarFile.type);

        const fileExt = mergedData.avatarFile.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        const filePath = `${organizationId}/avatars/${fileName}`;

        console.log('File extension:', fileExt);
        console.log('File name:', fileName);
        console.log('File path:', filePath);
        console.log('Attempting to upload to bucket "organizations"...');

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('organizations')
          .upload(filePath, mergedData.avatarFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          console.error('Error message:', uploadError.message);
          console.error('Full error object:', JSON.stringify(uploadError, null, 2));
          console.error('Avatar upload failed, but continuing without avatar URL');
        } else {
          console.log('Upload successful!', uploadData);

          const {
            data: { publicUrl },
          } = supabase.storage.from('organizations').getPublicUrl(filePath);

          avatarUrl = publicUrl;
          console.log('Public URL:', publicUrl);

          console.log('=== UPDATING ORGANIZATION WITH AVATAR URL ===');
          const { error: updateError } = await supabase
            .from('organizations')
            .update({ avatar_url: avatarUrl })
            .eq('id', organizationId);

          if (updateError) {
            console.error('Error updating avatar URL:', updateError);
            console.error('Full error:', JSON.stringify(updateError, null, 2));
          } else {
            console.log('Organization updated with avatar URL successfully');
          }
        }
      } else {
        console.log('No avatar file to upload');
      }

      clearData();
      
      // Small delay to ensure database changes are fully propagated
      // before redirecting to platform
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use window.location.href to force a full page reload
      // This ensures the server-side layout sees the newly created organization
      window.location.href = '/platform';
    } catch (err) {
      setCompletionError(
        'Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error')
      );
      setIsCompleting(false);
    }
  };

  const clearCompletionError = () => {
    setCompletionError(null);
    setIsCompleting(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        clearData,
        currentStep,
        setCurrentStep,
        maxStepReached,
        setMaxStepReached,
        organizationType,
        setOrganizationType: setOrganizationTypeWithReset,
        countries,
        user,
        isCompleting,
        completionError,
        completeOnboarding,
        clearCompletionError,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}
