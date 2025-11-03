import { z } from 'zod';
import {
  zBaseRow,
  zBaseInsert,
  zBaseUpdate,
  zSupabaseId,
  zSupabaseUUID,
  zSupabaseTimestamp,
} from '../base';
import { zOrganizationMemberRoleEnum, zOrganizationMemberStatusEnum } from '../enums';

export const zUserOrganizationRow = zBaseRow.extend({
  organization_id: zSupabaseId,
  user_id: zSupabaseUUID.nullable(),
  email: z.string(),
  role: zOrganizationMemberRoleEnum,
  status: zOrganizationMemberStatusEnum,
  joined_at: zSupabaseTimestamp.nullable(),
});

export const zUserOrganizationInsert = zBaseInsert.extend({
  organization_id: zSupabaseId,
  user_id: zSupabaseUUID.optional().nullable(),
  email: z.string(),
  role: zOrganizationMemberRoleEnum,
  status: zOrganizationMemberStatusEnum,
  joined_at: zSupabaseTimestamp.optional().nullable(),
});

export const zUserOrganizationUpdate = zBaseUpdate.extend({
  organization_id: zSupabaseId.optional(),
  user_id: zSupabaseUUID.optional().nullable(),
  email: z.string().optional(),
  role: zOrganizationMemberRoleEnum.optional(),
  status: zOrganizationMemberStatusEnum.optional(),
  joined_at: zSupabaseTimestamp.optional().nullable(),
});

export type TUserOrganizationRow = z.infer<typeof zUserOrganizationRow>;
export type TUserOrganizationInsert = z.infer<typeof zUserOrganizationInsert>;
export type TUserOrganizationUpdate = z.infer<typeof zUserOrganizationUpdate>;
