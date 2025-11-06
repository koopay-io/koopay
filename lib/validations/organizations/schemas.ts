import { z } from 'zod';
import { zBaseRow, zBaseInsert, zBaseUpdate, zSupabaseId } from '../shared/base';
import {
  zOrganizationTypeEnum,
  zOrganizationLegalTypeEnum,
  zOrganizationBusinessTypeEnum,
  zOrganizationIndustryTypeEnum,
} from '../shared/enums';

export const zOrganizationRow = zBaseRow.extend({
  type: zOrganizationTypeEnum,

  legal_type: zOrganizationLegalTypeEnum,

  name: z.string(),
  legal_name: z.string(),
  legal_id: z.string(),
  legal_phone: z.string().nullable(),
  avatar_url: z.string().nullable(),

  legal_country_id: zSupabaseId,
  legal_state: z.string(),
  legal_city: z.string(),
  legal_street_name: z.string(),
  legal_street_number: z.number().int(),
  legal_postal_code: z.string(),
  legal_suite: z.string().nullable(),
  legal_floor: z.string().nullable(),

  bio: z.string(),
  business_type: zOrganizationBusinessTypeEnum,
  custom_business_type: z.string().nullable(),
  industry_type: zOrganizationIndustryTypeEnum,
  custom_industry_type: z.string().nullable(),
});

export const zOrganizationInsert = zBaseInsert.extend({
  type: zOrganizationTypeEnum,

  legal_type: zOrganizationLegalTypeEnum,

  name: z.string(),
  legal_name: z.string(),
  legal_id: z.string(),
  legal_phone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),

  legal_country_id: zSupabaseId,
  legal_state: z.string(),
  legal_city: z.string(),
  legal_street_name: z.string(),
  legal_street_number: z.number().int(),
  legal_postal_code: z.string(),
  legal_suite: z.string().optional().nullable(),
  legal_floor: z.string().optional().nullable(),

  bio: z.string(),
  business_type: zOrganizationBusinessTypeEnum,
  custom_business_type: z.string().optional().nullable(),
  industry_type: zOrganizationIndustryTypeEnum,
  custom_industry_type: z.string().optional().nullable(),
});

export const zOrganizationUpdate = zBaseUpdate.extend({
  type: zOrganizationTypeEnum.optional(),
  legal_type: zOrganizationLegalTypeEnum.optional(),
  name: z.string().optional(),
  legal_name: z.string().optional(),
  legal_id: z.string().optional(),
  legal_phone: z.string().optional().nullable(),
  bio: z.string().optional(),
  avatar_url: z.string().optional().nullable(),

  legal_country_id: zSupabaseId.optional(),
  legal_state: z.string().optional(),
  legal_city: z.string().optional(),
  legal_street_name: z.string().optional(),
  legal_street_number: z.number().int().optional(),
  legal_postal_code: z.string().optional(),
  legal_suite: z.string().optional().nullable(),
  legal_floor: z.string().optional().nullable(),

  business_type: zOrganizationBusinessTypeEnum.optional(),
  custom_business_type: z.string().optional().nullable(),
  industry_type: zOrganizationIndustryTypeEnum.optional(),
  custom_industry_type: z.string().optional().nullable(),
});

export type TOrganizationRow = z.infer<typeof zOrganizationRow>;
export type TOrganizationInsert = z.infer<typeof zOrganizationInsert>;
export type TOrganizationUpdate = z.infer<typeof zOrganizationUpdate>;

