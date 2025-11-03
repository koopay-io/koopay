import { z } from 'zod';

export const zSupabaseId = z.number().int().positive();

export const zSupabaseUUID = z.uuid();

export const zSupabaseTimestamp = z.string();

export const zSupabaseJson: z.ZodType<
  string | number | boolean | null | { [key: string]: unknown } | Array<unknown>
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(z.string(), z.unknown()),
    z.array(z.unknown()),
  ])
);

export const zBaseRow = z.object({
  id: zSupabaseId,
  created_at: zSupabaseTimestamp,
  created_by: zSupabaseUUID,
  updated_at: zSupabaseTimestamp,
  updated_by: zSupabaseUUID,
  deleted_at: zSupabaseTimestamp.nullable(),
  deleted_by: zSupabaseUUID.nullable(),
});

export const zBaseInsert = z.object({});

export const zBaseUpdate = z.object({
  deleted_at: zSupabaseTimestamp.nullable().optional(),
  deleted_by: zSupabaseUUID.nullable().optional(),
});

export type TSupabaseId = z.infer<typeof zSupabaseId>;
export type TSupabaseUUID = z.infer<typeof zSupabaseUUID>;
export type TSupabaseTimestamp = z.infer<typeof zSupabaseTimestamp>;
export type TSupabaseJson = z.infer<typeof zSupabaseJson>;
export type TBaseRow = z.infer<typeof zBaseRow>;
export type TBaseInsert = z.infer<typeof zBaseInsert>;
export type TBaseUpdate = z.infer<typeof zBaseUpdate>;
