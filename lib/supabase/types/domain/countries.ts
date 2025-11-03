import { z } from 'zod';
import { zSupabaseId, zSupabaseTimestamp } from '../base';
import { zCurrencyCodeEnum } from '../enums';

export const zCountryRow = z.object({
  id: zSupabaseId,
  created_at: zSupabaseTimestamp,
  name: z.string(),
  official_name: z.string().nullable(),
  iso2: z.string().length(2),
  iso3: z.string().length(3),
  numeric_code: z.number().int().nullable(),
  emoji: z.string().nullable(),
  continent_id: z.number().int().positive().nullable(),
  subregion: z.string().nullable(),
  official_language: z.string().nullable(),
  currency_code: zCurrencyCodeEnum.nullable(),
  currency_name: z.string().nullable(),
  currency_symbol: z.string().nullable(),
  phone_code: z.string().nullable(),
  demonym: z.string().nullable(),
  region_code: z.string().nullable(),
  country_group: z.string().nullable(),
  available: z.boolean(),
});

export const zCountryInsert = z.object({
  name: z.string(),
  official_name: z.string().optional().nullable(),
  iso2: z.string().length(2),
  iso3: z.string().length(3),
  numeric_code: z.number().int().optional().nullable(),
  emoji: z.string().optional().nullable(),
  continent_id: z.number().int().positive().optional().nullable(),
  subregion: z.string().optional().nullable(),
  official_language: z.string().optional().nullable(),
  currency_code: zCurrencyCodeEnum.optional().nullable(),
  currency_name: z.string().optional().nullable(),
  currency_symbol: z.string().optional().nullable(),
  phone_code: z.string().optional().nullable(),
  demonym: z.string().optional().nullable(),
  region_code: z.string().optional().nullable(),
  country_group: z.string().optional().nullable(),
  available: z.boolean().optional(),
});

export const zCountryUpdate = z.object({
  name: z.string().optional(),
  official_name: z.string().optional().nullable(),
  iso2: z.string().length(2).optional(),
  iso3: z.string().length(3).optional(),
  numeric_code: z.number().int().optional().nullable(),
  emoji: z.string().optional().nullable(),
  continent_id: z.number().int().positive().optional().nullable(),
  subregion: z.string().optional().nullable(),
  official_language: z.string().optional().nullable(),
  currency_code: zCurrencyCodeEnum.optional().nullable(),
  currency_name: z.string().optional().nullable(),
  currency_symbol: z.string().optional().nullable(),
  phone_code: z.string().optional().nullable(),
  demonym: z.string().optional().nullable(),
  region_code: z.string().optional().nullable(),
  country_group: z.string().optional().nullable(),
  available: z.boolean().optional(),
});

export type TCountryRow = z.infer<typeof zCountryRow>;
export type TCountryInsert = z.infer<typeof zCountryInsert>;
export type TCountryUpdate = z.infer<typeof zCountryUpdate>;
