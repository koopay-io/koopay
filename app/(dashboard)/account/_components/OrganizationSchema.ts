import { z } from 'zod';
import {
  zOrganizationBusinessTypeEnum,
  zOrganizationIndustryTypeEnum,
} from '@/lib/validations/shared/enums';

export const createOrganizationSchema = (isIndividual: boolean) =>
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

