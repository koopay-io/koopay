import { z } from 'zod';

export const zUserRoleEnum = z.enum(['contractor', 'freelancer']);

export const zContractorTypeEnum = z.enum(['individual', 'company']);

export const zProjectStatusEnum = z.enum(['draft', 'active', 'completed', 'cancelled']);

export const zMilestoneStatusEnum = z.enum(['pending', 'in_progress', 'completed']);

export const zContractStatusEnum = z.enum(['draft', 'pending_signature', 'signed', 'completed']);

export const zNotificationTypeEnum = z.enum([
  'project_invitation',
  'contract_signed',
  'milestone_completed',
  'payment_received',
]);

export const zOrganizationTypeEnum = z.enum(['requester', 'provider']);

export const zOrganizationLegalTypeEnum = z.enum(['individual', 'company']);

export const zCurrencyCodeEnum = z.enum([
  'usd',
  'cad',
  'mxn',
  'bzd',
  'crc',
  'usd_sv',
  'gtq',
  'hnl',
  'nio',
  'pab',
  'cup',
  'dop',
  'htg',
  'jmd',
  'ttd',
  'bsd',
  'bbd',
  'xcd',
  'gyd',
  'ars',
  'bob',
  'brl',
  'clp',
  'cop',
  'usd_ec',
  'pyg',
  'pen',
  'uyu',
  'ves',
  'srd',
  'eur_gf',
  'eur',
  'gbp',
  'chf',
  'pln',
  'huf',
  'dkk',
  'sek',
  'nok',
  'isk',
  'rub',
  'try',
  'bgn',
  'hrk',
  'mkd',
  'rsd',
  'bam',
  'mdl',
  'uah',
  'byn',
  'all',
  'czk',
  'nzd',
  'kzt',
  'amd',
  'azn',
  'kwd',
  'lbp',
  'gel',
  'ron',
  'ils',
  'xpf',
]);

export const zOrganizationBusinessTypeEnum = z.enum([
  'freelance',
  'agency',
  'consultant',
  'creator',
  'team',
  'company',
  'other',
]);

export const zOrganizationIndustryTypeEnum = z.enum([
  'Technology',
  'Artificial Intelligence',
  'Web3 / Finance',
  'Design / Creative',
  'Consulting',
  'Legal Services',
  'Construction',
  'Health',
  'Media Production',
  'Non Profit / Social',
  'Manufacturing',
  'Retail / Ecommerce',
  'Travel / Hospitality',
  'Real Estate',
  'Other',
]);

export const zOrganizationMemberRoleEnum = z.enum(['owner', 'admin', 'member']);

export const zOrganizationMemberStatusEnum = z.enum(['active', 'pending']);

export type EUserRole = z.infer<typeof zUserRoleEnum>;
export type EContractorType = z.infer<typeof zContractorTypeEnum>;
export type EProjectStatus = z.infer<typeof zProjectStatusEnum>;
export type EMilestoneStatus = z.infer<typeof zMilestoneStatusEnum>;
export type EContractStatus = z.infer<typeof zContractStatusEnum>;
export type ENotificationType = z.infer<typeof zNotificationTypeEnum>;
export type EOrganizationType = z.infer<typeof zOrganizationTypeEnum>;
export type EOrganizationLegalType = z.infer<typeof zOrganizationLegalTypeEnum>;
export type ECurrencyCode = z.infer<typeof zCurrencyCodeEnum>;
export type EOrganizationBusinessType = z.infer<typeof zOrganizationBusinessTypeEnum>;
export type EOrganizationIndustryType = z.infer<typeof zOrganizationIndustryTypeEnum>;
export type EOrganizationMemberRole = z.infer<typeof zOrganizationMemberRoleEnum>;
export type EOrganizationMemberStatus = z.infer<typeof zOrganizationMemberStatusEnum>;
