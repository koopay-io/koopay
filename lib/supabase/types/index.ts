import { TContinentInsert, TContinentRow, TContinentUpdate } from './domain/continents';
import { TCountryInsert, TCountryRow, TCountryUpdate } from './domain/countries';
import { TOrganizationInsert, TOrganizationRow, TOrganizationUpdate } from './domain/organizations';
import {
  TUserOrganizationInsert,
  TUserOrganizationRow,
  TUserOrganizationUpdate,
} from './domain/user_organization';
import {
  EUserRole,
  EContractorType,
  EProjectStatus,
  EMilestoneStatus,
  EContractStatus,
  ENotificationType,
  EOrganizationType,
  EOrganizationLegalType,
  ECurrencyCode,
  EOrganizationBusinessType,
  EOrganizationIndustryType,
  EOrganizationMemberRole,
  EOrganizationMemberStatus,
} from './enums';

export interface IDatabase {
  public: {
    continents: {
      Row: TContinentRow;
      Insert: TContinentInsert;
      Update: TContinentUpdate;
    };

    countries: {
      Row: TCountryRow;
      Insert: TCountryInsert;
      Update: TCountryUpdate;
    };

    organizations: {
      Row: TOrganizationRow;
      Insert: TOrganizationInsert;
      Update: TOrganizationUpdate;
    };

    user_organization: {
      Row: TUserOrganizationRow;
      Insert: TUserOrganizationInsert;
      Update: TUserOrganizationUpdate;
    };

    Enums: {
      user_role: EUserRole;
      contractor_type: EContractorType;
      project_status: EProjectStatus;
      milestone_status: EMilestoneStatus;
      contract_status: EContractStatus;
      notification_type: ENotificationType;
      organization_type: EOrganizationType;
      organization_legal_type: EOrganizationLegalType;
      currency_code: ECurrencyCode;
      organization_business_type: EOrganizationBusinessType;
      organization_industry_type: EOrganizationIndustryType;
      organization_member_role: EOrganizationMemberRole;
      organization_member_status: EOrganizationMemberStatus;
    };
  };
}
