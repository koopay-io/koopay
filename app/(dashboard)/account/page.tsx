'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGlobalStore } from '@/lib/stores/globalStore';
import { createClient } from '@/lib/supabase/client';
import { useStellarWallet } from '@/lib/hooks/useStellarWallet';
import {
  Copy,
  Share2,
  Save,
  Wallet,
  Eye,
  EyeOff,
  User,
  Plus,
  ArrowUpRight,
  Trash2,
  Info,
  Building2,
  ChevronsUpDown,
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TeamSwitcher } from '../_components/TeamSwitcher';
import { TOrganizationUpdate, TOrganizationRow } from '@/lib/validations/organizations';
import {
  zOrganizationBusinessTypeEnum,
  zOrganizationIndustryTypeEnum,
  EOrganizationBusinessType,
  EOrganizationIndustryType,
} from '@/lib/validations/shared/enums';
import { TCountryRow } from '@/lib/validations/countries';
import {
  TGetUserOrganizationsResponse,
  zGetUserOrganizationsResponse,
  TGetUserOrganizationsParams,
} from '@/lib/validations/shared/functions';

const createOrganizationSchema = (isIndividual: boolean) =>
  z.object({
    name: isIndividual
      ? z.string().optional()
      : z.string().min(2, 'Name must be at least 2 characters').max(200),
    legal_name: z.string().min(2, 'Legal name must be at least 2 characters').max(200),
    legal_id: z.string().min(3, 'ID must be at least 3 characters').max(100),
    legal_phone: z.string().nullable().optional(),
    bio: z.string().min(10, 'Bio must be at least 10 characters').max(2000),
    business_type: z.string().refine((val) => zOrganizationBusinessTypeEnum.safeParse(val).success),
    custom_business_type: z.string().nullable().optional(),
    industry_type: z.string().refine((val) => zOrganizationIndustryTypeEnum.safeParse(val).success),
    custom_industry_type: z.string().nullable().optional(),
    legal_country_id: z.number().int().positive(),
    legal_state: z.string().min(2).max(100),
    legal_city: z.string().min(2).max(100),
    legal_street_name: z.string().min(2).max(200),
    legal_street_number: z.number().int().positive(),
    legal_postal_code: z.string().min(4).max(12),
    legal_suite: z.string().nullable().optional(),
    legal_floor: z.string().nullable().optional(),
  });

export default function AccountPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<TCountryRow[]>([]);
  const { currentOrganization, user, setOrganizations } = useGlobalStore();
  const {
    wallet,
    balance,
    isLoading: walletLoading,
    refreshBalance,
    sendPayment,
  } = useStellarWallet();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isIndividual = currentOrganization?.legal_type === 'individual';
  const organizationSchema = createOrganizationSchema(isIndividual);
  type OrganizationFormData = z.infer<typeof organizationSchema>;

  const organizationUrl = currentOrganization
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/organizations/${
        currentOrganization.id
      }`
    : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: currentOrganization
      ? {
          name: currentOrganization.name,
          legal_name: currentOrganization.legal_name,
          legal_id: currentOrganization.legal_id,
          legal_phone: currentOrganization.legal_phone || '',
          bio: currentOrganization.bio,
          business_type: currentOrganization.business_type,
          custom_business_type: currentOrganization.custom_business_type || '',
          industry_type: currentOrganization.industry_type,
          custom_industry_type: currentOrganization.custom_industry_type || '',
          legal_country_id: currentOrganization.legal_country_id,
          legal_state: currentOrganization.legal_state,
          legal_city: currentOrganization.legal_city,
          legal_street_name: currentOrganization.legal_street_name,
          legal_street_number: currentOrganization.legal_street_number,
          legal_postal_code: currentOrganization.legal_postal_code,
          legal_suite: currentOrganization.legal_suite || '',
          legal_floor: currentOrganization.legal_floor || '',
        }
      : undefined,
  });

  useEffect(() => {
    const fetchCountries = async () => {
      const supabaseClient = createClient();
      const { data } = await supabaseClient
        .from('countries')
        .select('*')
        .eq('available', true)
        .order('name', { ascending: true });
      if (data) {
        setCountries(data);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (currentOrganization) {
      reset({
        name: currentOrganization.name,
        legal_name: currentOrganization.legal_name,
        legal_id: currentOrganization.legal_id,
        legal_phone: currentOrganization.legal_phone || '',
        bio: currentOrganization.bio,
        business_type: currentOrganization.business_type,
        custom_business_type: currentOrganization.custom_business_type || '',
        industry_type: currentOrganization.industry_type,
        custom_industry_type: currentOrganization.custom_industry_type || '',
        legal_country_id: currentOrganization.legal_country_id,
        legal_state: currentOrganization.legal_state,
        legal_city: currentOrganization.legal_city,
        legal_street_name: currentOrganization.legal_street_name,
        legal_street_number: currentOrganization.legal_street_number,
        legal_postal_code: currentOrganization.legal_postal_code,
        legal_suite: currentOrganization.legal_suite || '',
        legal_floor: currentOrganization.legal_floor || '',
      });
      if (currentOrganization.avatar_url) {
        setAvatarPreview(currentOrganization.avatar_url);
      }
    }
  }, [currentOrganization, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must not exceed 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: currentOrganization?.name || 'Organization',
        url: organizationUrl,
      });
    } else {
      copyToClipboard(organizationUrl);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawDestination || !withdrawAmount || !wallet) return;

    setIsWithdrawing(true);
    try {
      const txHash = await sendPayment(withdrawDestination, withdrawAmount);
      if (txHash) {
        setWithdrawDestination('');
        setWithdrawAmount('');
        setShowWithdrawDialog(false);
        toast.success('Withdrawal successful!');
        await refreshBalance();
      }
    } catch (error) {
      toast.error(
        'Withdrawal failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentOrganization || !user) return;

    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    await performDelete();
  };

  const performDelete = async () => {
    if (!currentOrganization || !user) return;

    setIsDeleting(true);
    try {
      const supabaseClient = createClient();
      const updatePayload = {
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      };
      const deleteResult = (await (
        supabaseClient.from('organizations') as unknown as {
          update: (payload: typeof updatePayload) => {
            eq: (column: string, value: string | number) => Promise<{ error: Error | null }>;
          };
        }
      )
        .update(updatePayload as unknown as never)
        .eq('id', currentOrganization.id)) as unknown as { error: Error | null };
      const { error } = deleteResult;

      if (error) throw error;

      toast.success('Account deleted successfully');
      router.push('/onboarding');
    } catch (error) {
      toast.error(
        'Failed to delete account: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (formData: OrganizationFormData) => {
    if (!currentOrganization || !user) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const supabaseClient = createClient();
      let avatarUrl = currentOrganization.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        const filePath = `${currentOrganization.id}/avatars/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('organizations')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage
          .from('organizations')
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }

      // Parse business_type and industry_type to ensure they are valid enum values
      const businessTypeParse = zOrganizationBusinessTypeEnum.safeParse(formData.business_type);
      const industryTypeParse = zOrganizationIndustryTypeEnum.safeParse(formData.industry_type);

      if (!businessTypeParse.success) {
        throw new Error('Invalid business type');
      }
      if (!industryTypeParse.success) {
        throw new Error('Invalid industry type');
      }

      const updateData: TOrganizationUpdate = {
        name: isIndividual ? `${formData.legal_name}'s Org` : formData.name,
        legal_name: formData.legal_name,
        legal_id: formData.legal_id,
        legal_phone: formData.legal_phone || null,
        bio: formData.bio,
        business_type: businessTypeParse.data as EOrganizationBusinessType,
        custom_business_type: formData.custom_business_type || null,
        industry_type: industryTypeParse.data as EOrganizationIndustryType,
        custom_industry_type: formData.custom_industry_type || null,
        legal_country_id: formData.legal_country_id,
        legal_state: formData.legal_state,
        legal_city: formData.legal_city,
        legal_street_name: formData.legal_street_name,
        legal_street_number: formData.legal_street_number,
        legal_postal_code: formData.legal_postal_code,
        legal_suite: formData.legal_suite || null,
        legal_floor: formData.legal_floor || null,
        avatar_url: avatarUrl,
      };

      const updateResult = (await (
        supabaseClient.from('organizations') as unknown as {
          update: (payload: typeof updateData) => {
            eq: (
              column: string,
              value: string | number
            ) => {
              select: () => {
                single: () => Promise<{ data: TOrganizationRow | null; error: Error | null }>;
              };
            };
          };
        }
      )
        .update(updateData as unknown as never)
        .eq('id', currentOrganization.id)
        .select()
        .single()) as { data: TOrganizationRow | null; error: Error | null };
      const { data: updatedOrg, error } = updateResult;

      if (error) throw error;

      const rpcParams: TGetUserOrganizationsParams = {
        p_user_id: user.id,
      };
      const rpcResult = (await (
        supabaseClient.rpc as unknown as (
          name: string,
          params: TGetUserOrganizationsParams
        ) => Promise<{ data: TGetUserOrganizationsResponse | null }>
      )('get_user_organizations', rpcParams)) as { data: TGetUserOrganizationsResponse | null };
      const { data: orgsData } = rpcResult;

      if (orgsData) {
        const parsedResponse = zGetUserOrganizationsResponse.parse(orgsData);
        setOrganizations(parsedResponse.organizations);
      }

      toast.success('Account updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading organization data...</p>
        </div>
      </div>
    );
  }

  const countryIdValue = watch('legal_country_id');
  const totalBalance = balance.reduce((sum, bal) => sum + parseFloat(bal.balance), 0);
  const xlmBalance = balance.find((b) => b.asset === 'XLM')?.balance || '0';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl">
      <div className="space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden sm:block">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your account information and settings
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <TeamSwitcher variant="full" />
          </div>
        </div>

        <div className="lg:hidden space-y-4">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Organization QR Code</CardTitle>
              <CardDescription className="text-sm">
                Share this QR code to let others find your organization
              </CardDescription>
            </CardHeader>
            <CardContent>{renderQRCode()}</CardContent>
          </Card>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="mt-4 space-y-4">
              {renderAccountForm()}
            </TabsContent>
            <TabsContent value="wallet" className="mt-4">
              {renderWalletSection()}
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Organization QR Code</CardTitle>
                <CardDescription className="text-sm">
                  Share this QR code to let others find your organization
                </CardDescription>
              </CardHeader>
              <CardContent>{renderQRCode()}</CardContent>
            </Card>
            {renderAccountForm()}
          </div>
          <div className="space-y-6">{renderWalletSection()}</div>
        </div>
      </div>
    </div>
  );

  function renderQRCode() {
    return (
      <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-card rounded-lg border">
        {organizationUrl && (
          <QRCodeSVG
            value={organizationUrl}
            size={typeof window !== 'undefined' && window.innerWidth < 640 ? 180 : 200}
            level="H"
            includeMargin={true}
            fgColor="#ffffff"
            bgColor="#16132c"
          />
        )}
        <div className="w-full max-w-md">
          <div className="flex gap-2">
            <Input
              value={organizationUrl}
              readOnly
              className="flex-1 font-mono text-xs sm:text-sm"
            />
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(organizationUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={shareUrl}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderAccountForm() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Update your organization details</CardDescription>
        </CardHeader>
        <CardContent>
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
                <label htmlFor="avatar" className="cursor-pointer block">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border-2 border-border hover:border-primary transition-colors rounded-full">
                    {avatarPreview ? <AvatarImage src={avatarPreview} alt="Avatar" /> : null}
                    <AvatarFallback className="bg-primary/20">
                      {currentOrganization?.legal_type === 'individual' ? (
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/60" />
                      ) : (
                        <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/60" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </label>
              </div>
              <div className="flex-1">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <p className="text-foreground/60 text-sm">Click to change logo</p>
                </Label>
              </div>
            </div>

            {!isIndividual && (
              <div>
                <Label htmlFor="name">
                  Organization Name <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register('name')} className="mt-2" />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="legal_name">
                Legal Name <span className="text-destructive">*</span>
              </Label>
              <Input id="legal_name" {...register('legal_name')} className="mt-2" />
              {errors.legal_name && (
                <p className="text-destructive text-sm mt-1">{errors.legal_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="legal_id">
                Legal ID <span className="text-destructive">*</span>
              </Label>
              <Input id="legal_id" {...register('legal_id')} className="mt-2" />
              {errors.legal_id && (
                <p className="text-destructive text-sm mt-1">{errors.legal_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="legal_phone">Phone</Label>
              <Input id="legal_phone" type="tel" {...register('legal_phone')} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="bio">
                Bio <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bio"
                {...register('bio')}
                rows={4}
                className="mt-2"
                placeholder="Tell us about your organization..."
              />
              {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
            </div>

            <div>
              <Label htmlFor="business_type">
                Business Type <span className="text-destructive">*</span>
              </Label>
              <Select
                id="business_type"
                className="mt-2"
                value={watch('business_type')}
                onChange={(e) => setValue('business_type', e.target.value)}
              >
                <option value="b2b">B2B</option>
                <option value="b2c">B2C</option>
                <option value="b2g">B2G</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="other">Other</option>
              </Select>
            </div>

            {watch('business_type') === 'other' && (
              <div>
                <Label htmlFor="custom_business_type">Custom Business Type</Label>
                <Input
                  id="custom_business_type"
                  {...register('custom_business_type')}
                  className="mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="industry_type">
                Industry Type <span className="text-destructive">*</span>
              </Label>
              <Select
                id="industry_type"
                className="mt-2"
                value={watch('industry_type')}
                onChange={(e) => setValue('industry_type', e.target.value)}
              >
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </Select>
            </div>

            {watch('industry_type') === 'other' && (
              <div>
                <Label htmlFor="custom_industry_type">Custom Industry Type</Label>
                <Input
                  id="custom_industry_type"
                  {...register('custom_industry_type')}
                  className="mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="legal_country_id">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select
                id="legal_country_id"
                className="mt-2"
                value={countryIdValue?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  if (value && value > 0) {
                    setValue('legal_country_id', value);
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="legal_state">
                  State/Province <span className="text-destructive">*</span>
                </Label>
                <Input id="legal_state" {...register('legal_state')} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="legal_city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input id="legal_city" {...register('legal_city')} className="mt-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="legal_street_name">
                Street Name <span className="text-destructive">*</span>
              </Label>
              <Input id="legal_street_name" {...register('legal_street_name')} className="mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="legal_street_number">
                  Street Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="legal_street_number"
                  type="number"
                  {...register('legal_street_number', { valueAsNumber: true })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="legal_postal_code">
                  Postal Code <span className="text-destructive">*</span>
                </Label>
                <Input id="legal_postal_code" {...register('legal_postal_code')} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="legal_suite">Suite</Label>
                <Input id="legal_suite" {...register('legal_suite')} className="mt-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="legal_floor">Floor</Label>
              <Input id="legal_floor" {...register('legal_floor')} className="mt-2" />
            </div>

            {saveError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{saveError}</p>
              </div>
            )}

            <Button type="submit" disabled={isSaving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={performDelete}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  function renderWalletSection() {
    if (!wallet) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Stellar Wallet
            </CardTitle>
            <CardDescription>No wallet found</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stellar Wallet
          </CardTitle>
          <CardDescription>Your invisible wallet managed automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">
              {parseFloat(xlmBalance).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 7,
              })}{' '}
              XLM
            </div>
            <p className="text-muted-foreground text-sm">${totalBalance.toFixed(2)} USD (approx)</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Funds</DialogTitle>
                  <DialogDescription>
                    Send XLM from an external wallet to your public address on Stellar testnet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border">
                    <QRCodeSVG
                      value={wallet.publicKey}
                      size={180}
                      level="H"
                      includeMargin={true}
                      fgColor="#ffffff"
                      bgColor="#16132c"
                    />
                  </div>
                  <div>
                    <Label>Your Public Address</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={wallet.publicKey}
                        readOnly
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.publicKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg flex gap-3">
                    <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">To start using this wallet:</p>
                      <p>
                        Send at least 1 XLM from an external wallet to the address above on Stellar
                        testnet.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">Withdraw</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>Send XLM to another Stellar address</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-destination">Destination Address</Label>
                    <Input
                      id="withdraw-destination"
                      placeholder="Enter Stellar address..."
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdraw-amount">Amount (XLM)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      step="0.0000001"
                      placeholder="0.0000001"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={!withdrawDestination || !withdrawAmount || isWithdrawing}
                    className="w-full"
                  >
                    {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => copyToClipboard(wallet.publicKey)}
            >
              <Copy className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Copy</span>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Balance</Label>
              <Button variant="ghost" size="sm" onClick={refreshBalance} disabled={walletLoading}>
                {walletLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            {walletLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
            ) : balance.length === 0 ? (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">No balance found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {balance.map((bal, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{bal.asset}</span>
                    <span className="font-mono">{bal.balance}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t space-y-4">
            <div>
              <Label className="text-sm font-medium">Public Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono break-all">
                  {wallet.publicKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.publicKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Secret Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono break-all">
                  {showSecret
                    ? wallet.secretKey
                    : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </code>
                <Button variant="outline" size="sm" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.secretKey || '')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}
