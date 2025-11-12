drop trigger if exists "set_continents_updated_fields" on "public"."continents";

drop trigger if exists "update_contractor_profiles_updated_at" on "public"."contractor_profiles";

drop trigger if exists "update_contracts_updated_at" on "public"."contracts";

drop trigger if exists "set_disputes_updated_fields" on "public"."disputes";

drop trigger if exists "set_evidences_updated_fields" on "public"."evidences";

drop trigger if exists "update_freelancer_profiles_updated_at" on "public"."freelancer_profiles";

drop trigger if exists "update_milestones_updated_at" on "public"."milestones";

drop trigger if exists "set_organizations_updated_fields" on "public"."organizations";

drop trigger if exists "set_payments_updated_fields" on "public"."payments";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop trigger if exists "update_projects_updated_at" on "public"."projects";

drop trigger if exists "set_projects2_updated_fields" on "public"."projects2";

drop trigger if exists "set_organization_members_updated_fields" on "public"."user_organization";

drop policy "Contractors can manage milestones" on "public"."milestones";

drop policy "Project participants can view milestones" on "public"."milestones";

drop policy "Owners and Admins can update their own organizations" on "public"."organizations";

alter table "public"."contractor_profiles" drop constraint "contractor_profiles_id_fkey";

alter table "public"."contracts" drop constraint "contracts_contractor_id_fkey";

alter table "public"."contracts" drop constraint "contracts_freelancer_id_fkey";

alter table "public"."contracts" drop constraint "contracts_project_id_fkey";

alter table "public"."countries" drop constraint "countries_continent_id_fkey";

alter table "public"."freelancer_profiles" drop constraint "freelancer_profiles_id_fkey";

alter table "public"."milestones" drop constraint "milestones_project_id_fkey";

alter table "public"."notifications" drop constraint "notifications_project_id_fkey";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."organizations" drop constraint "organizations_legal_country_id_fkey";

alter table "public"."project_invitations" drop constraint "project_invitations_contractor_id_fkey";

alter table "public"."project_invitations" drop constraint "project_invitations_freelancer_id_fkey";

alter table "public"."project_invitations" drop constraint "project_invitations_project_id_fkey";

alter table "public"."projects" drop constraint "projects_contractor_id_fkey";

alter table "public"."projects" drop constraint "projects_freelancer_id_fkey";

alter table "public"."user_organization" drop constraint "organization_members_organization_id_fkey";

alter table "public"."contractor_profiles" alter column "contractor_type" set data type public.contractor_type using "contractor_type"::text::public.contractor_type;

alter table "public"."contracts" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."contracts" alter column "status" set default 'draft'::public.contract_status;

alter table "public"."contracts" alter column "status" set data type public.contract_status using "status"::text::public.contract_status;

alter table "public"."countries" alter column "currency_code" set data type public.currency_code using "currency_code"::text::public.currency_code;

alter table "public"."milestones" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."milestones" alter column "status" set default 'pending'::public.milestone_status;

alter table "public"."milestones" alter column "status" set data type public.milestone_status using "status"::text::public.milestone_status;

alter table "public"."notifications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."notifications" alter column "type" set data type public.notification_type using "type"::text::public.notification_type;

alter table "public"."organizations" alter column "business_type" set data type public.organization_business_type using "business_type"::text::public.organization_business_type;

alter table "public"."organizations" alter column "industry_type" set data type public.organization_industry_type using "industry_type"::text::public.organization_industry_type;

alter table "public"."organizations" alter column "legal_type" set data type public.organization_legal_type using "legal_type"::text::public.organization_legal_type;

alter table "public"."organizations" alter column "type" set data type public.organization_type using "type"::text::public.organization_type;

alter table "public"."profiles" alter column "role" set data type public.user_role using "role"::text::public.user_role;

alter table "public"."project_invitations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."projects" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."projects" alter column "status" set default 'draft'::public.project_status;

alter table "public"."projects" alter column "status" set data type public.project_status using "status"::text::public.project_status;

alter table "public"."user_organization" alter column "role" set data type public.organization_member_role using "role"::text::public.organization_member_role;

alter table "public"."user_organization" alter column "status" set data type public.organization_member_status using "status"::text::public.organization_member_status;

alter table "public"."contractor_profiles" add constraint "contractor_profiles_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."contractor_profiles" validate constraint "contractor_profiles_id_fkey";

alter table "public"."contracts" add constraint "contracts_contractor_id_fkey" FOREIGN KEY (contractor_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_contractor_id_fkey";

alter table "public"."contracts" add constraint "contracts_freelancer_id_fkey" FOREIGN KEY (freelancer_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_freelancer_id_fkey";

alter table "public"."contracts" add constraint "contracts_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_project_id_fkey";

alter table "public"."countries" add constraint "countries_continent_id_fkey" FOREIGN KEY (continent_id) REFERENCES public.continents(id) ON DELETE SET NULL not valid;

alter table "public"."countries" validate constraint "countries_continent_id_fkey";

alter table "public"."freelancer_profiles" add constraint "freelancer_profiles_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."freelancer_profiles" validate constraint "freelancer_profiles_id_fkey";

alter table "public"."milestones" add constraint "milestones_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."milestones" validate constraint "milestones_project_id_fkey";

alter table "public"."notifications" add constraint "notifications_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_project_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."organizations" add constraint "organizations_legal_country_id_fkey" FOREIGN KEY (legal_country_id) REFERENCES public.countries(id) not valid;

alter table "public"."organizations" validate constraint "organizations_legal_country_id_fkey";

alter table "public"."project_invitations" add constraint "project_invitations_contractor_id_fkey" FOREIGN KEY (contractor_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."project_invitations" validate constraint "project_invitations_contractor_id_fkey";

alter table "public"."project_invitations" add constraint "project_invitations_freelancer_id_fkey" FOREIGN KEY (freelancer_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."project_invitations" validate constraint "project_invitations_freelancer_id_fkey";

alter table "public"."project_invitations" add constraint "project_invitations_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."project_invitations" validate constraint "project_invitations_project_id_fkey";

alter table "public"."projects" add constraint "projects_contractor_id_fkey" FOREIGN KEY (contractor_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_contractor_id_fkey";

alter table "public"."projects" add constraint "projects_freelancer_id_fkey" FOREIGN KEY (freelancer_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."projects" validate constraint "projects_freelancer_id_fkey";

alter table "public"."user_organization" add constraint "organization_members_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) not valid;

alter table "public"."user_organization" validate constraint "organization_members_organization_id_fkey";


  create policy "Contractors can manage milestones"
  on "public"."milestones"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = milestones.project_id) AND (projects.contractor_id = auth.uid())))));



  create policy "Project participants can view milestones"
  on "public"."milestones"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = milestones.project_id) AND ((projects.contractor_id = auth.uid()) OR (projects.freelancer_id = auth.uid()))))));



  create policy "Owners and Admins can update their own organizations"
  on "public"."organizations"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_organization uo
  WHERE ((uo.organization_id = organizations.id) AND (uo.user_id = auth.uid()) AND (uo.role = ANY (ARRAY['owner'::public.organization_member_role, 'admin'::public.organization_member_role])) AND (uo.deleted_at IS NULL) AND (uo.deleted_by IS NULL)))))
with check ((EXISTS ( SELECT 1
   FROM public.user_organization uo
  WHERE ((uo.organization_id = organizations.id) AND (uo.user_id = auth.uid()) AND (uo.role = ANY (ARRAY['owner'::public.organization_member_role, 'admin'::public.organization_member_role])) AND (uo.deleted_at IS NULL) AND (uo.deleted_by IS NULL)))));


CREATE TRIGGER set_continents_updated_fields AFTER UPDATE ON public.continents FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

CREATE TRIGGER update_contractor_profiles_updated_at BEFORE UPDATE ON public.contractor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_disputes_updated_fields AFTER UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

CREATE TRIGGER set_evidences_updated_fields AFTER UPDATE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

CREATE TRIGGER update_freelancer_profiles_updated_at BEFORE UPDATE ON public.freelancer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_organizations_updated_fields AFTER UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

CREATE TRIGGER set_payments_updated_fields AFTER UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_projects2_updated_fields AFTER UPDATE ON public.projects2 FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

CREATE TRIGGER set_organization_members_updated_fields AFTER UPDATE ON public.user_organization FOR EACH ROW EXECUTE FUNCTION public.set_updated_fields();

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

drop policy "Allow owners and admins to CRUD 105zue8_0" on "storage"."objects";

drop policy "Allow owners and admins to CRUD 105zue8_1" on "storage"."objects";

drop policy "Allow owners and admins to CRUD 105zue8_2" on "storage"."objects";

drop policy "Allow owners and admins to CRUD 105zue8_3" on "storage"."objects";

drop policy "Project participants can view contracts" on "storage"."objects";


  create policy "Allow owners and admins to CRUD 105zue8_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'organizations'::text) AND (EXISTS ( SELECT 1
   FROM public.user_organization uo
  WHERE (((uo.organization_id)::text = (storage.foldername(objects.name))[1]) AND (uo.user_id = auth.uid()) AND (uo.role = ANY (ARRAY['owner'::public.organization_member_role, 'admin'::public.organization_member_role])) AND (uo.deleted_at IS NULL) AND (uo.deleted_by IS NULL))))));



  create policy "Allow owners and admins to CRUD 105zue8_1"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'organizations'::text) AND (EXISTS ( SELECT 1
   FROM public.user_organization uo
  WHERE (((uo.organization_id)::text = (storage.foldername(objects.name))[1]) AND (uo.user_id = auth.uid()) AND (uo.role = ANY (ARRAY['owner'::public.organization_member_role, 'admin'::public.organization_member_role])) AND (uo.deleted_at IS NULL) AND (uo.deleted_by IS NULL))))));



  create policy "Allow owners and admins to CRUD 105zue8_2"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'organizations'::text) AND (EXISTS ( SELECT 1
   FROM public.user_organization uo
  WHERE (((uo.organization_id)::text = (storage.foldername(objects.name))[1]) AND (uo.user_id = auth.uid()) AND (uo.role = ANY (ARRAY['owner'::public.organization_member_role, 'admin'::public.organization_member_role])) AND (uo.deleted_at IS NULL) AND (uo.deleted_by IS NULL))))));



  create policy "Allow owners and admins to CRUD 105zue8_3"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'organizations'::text) AND (EXISTS ( SELECT 1
   FROM public.user_organization uo
  WHERE (((uo.organization_id)::text = (storage.foldername(objects.name))[1]) AND (uo.user_id = auth.uid()) AND (uo.role = ANY (ARRAY['owner'::public.organization_member_role, 'admin'::public.organization_member_role])) AND (uo.deleted_at IS NULL) AND (uo.deleted_by IS NULL))))));



  create policy "Project participants can view contracts"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'contracts'::text) AND (EXISTS ( SELECT 1
   FROM public.contracts c
  WHERE ((c.contract_url ~~ (('%'::text || objects.name) || '%'::text)) AND ((c.contractor_id = auth.uid()) OR (c.freelancer_id = auth.uid())))))));



