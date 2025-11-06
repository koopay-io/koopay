import { z } from 'zod';
import { zSupabaseId, zSupabaseTimestamp } from '../shared/base';

export const zContinentRow = z.object({
  id: zSupabaseId,
  created_at: zSupabaseTimestamp,
  name: z.string(),
  code: z.string(),
  emoji: z.string().nullable(),
  description: z.string().nullable(),
});

export const zContinentInsert = z.object({
  name: z.string(),
  code: z.string(),
  emoji: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const zContinentUpdate = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  emoji: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type TContinentRow = z.infer<typeof zContinentRow>;
export type TContinentInsert = z.infer<typeof zContinentInsert>;
export type TContinentUpdate = z.infer<typeof zContinentUpdate>;

