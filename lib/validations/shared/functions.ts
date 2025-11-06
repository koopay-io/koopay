import { z } from 'zod';
import { zOrganizationRow } from '../organizations';
import { zSupabaseUUID } from './base';

export const zGetUserOrganizationsParams = z.object({
  p_user_id: zSupabaseUUID,
});

export const zGetUserOrganizationsResponse = z.object({
  total: z.number().int().nonnegative(),
  organizations: z.array(zOrganizationRow),
});

export type TGetUserOrganizationsParams = z.infer<typeof zGetUserOrganizationsParams>;
export type TGetUserOrganizationsResponse = z.infer<typeof zGetUserOrganizationsResponse>;

