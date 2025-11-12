


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."contract_status" AS ENUM (
    'draft',
    'pending_signature',
    'signed',
    'completed'
);


ALTER TYPE "public"."contract_status" OWNER TO "postgres";


CREATE TYPE "public"."contractor_type" AS ENUM (
    'individual',
    'company'
);


ALTER TYPE "public"."contractor_type" OWNER TO "postgres";


CREATE TYPE "public"."currency_code" AS ENUM (
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
    'xpf'
);


ALTER TYPE "public"."currency_code" OWNER TO "postgres";


CREATE TYPE "public"."milestone_status" AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


ALTER TYPE "public"."milestone_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'project_invitation',
    'contract_signed',
    'milestone_completed',
    'payment_received'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_business_type" AS ENUM (
    'freelance',
    'agency',
    'consultant',
    'creator',
    'team',
    'company',
    'other'
);


ALTER TYPE "public"."organization_business_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_industry_type" AS ENUM (
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
    'Other'
);


ALTER TYPE "public"."organization_industry_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_legal_type" AS ENUM (
    'individual',
    'company'
);


ALTER TYPE "public"."organization_legal_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_member_role" AS ENUM (
    'owner',
    'admin',
    'member'
);


ALTER TYPE "public"."organization_member_role" OWNER TO "postgres";


CREATE TYPE "public"."organization_member_status" AS ENUM (
    'active',
    'pending'
);


ALTER TYPE "public"."organization_member_status" OWNER TO "postgres";


CREATE TYPE "public"."organization_type" AS ENUM (
    'requester',
    'provider'
);


ALTER TYPE "public"."organization_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."organization_type" IS 'Si es un requester de servicios/proyectos o si es un provider de servicios/proyectos';



CREATE TYPE "public"."project_status" AS ENUM (
    'draft',
    'active',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'contractor',
    'freelancer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organizations"("p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  result json;
begin
  select json_build_object(
    'total', count(*),
    'organizations', coalesce(json_agg(o order by o.created_at desc), '[]'::json)
  )
  into result
  from public.organizations o
  where o.created_by = p_user_id
    and o.deleted_at is null;

  return result;
end;
$$;


ALTER FUNCTION "public"."get_user_organizations"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'freelancer')::user_role
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Actualiza la marca de tiempo
  new.updated_at := now();

  -- Establece el usuario que realizó la acción desde el JWT (si existe)
  if current_setting('request.jwt.claims', true) is not null then
    new.updated_by := (current_setting('request.jwt.claims', true)::json)->>'sub';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


ALTER TABLE "public"."admins" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."admins_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."continents" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "emoji" "text",
    "description" "text"
);


ALTER TABLE "public"."continents" OWNER TO "postgres";


ALTER TABLE "public"."continents" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."continents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contractor_profiles" (
    "id" "uuid" NOT NULL,
    "contractor_type" "public"."contractor_type" NOT NULL,
    "full_name" "text",
    "individual_id" "text",
    "legal_name" "text",
    "display_name" "text",
    "business_id" "text",
    "logo_url" "text",
    "website_url" "text",
    "country" "text" NOT NULL,
    "address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contractor_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "contractor_id" "uuid" NOT NULL,
    "freelancer_id" "uuid" NOT NULL,
    "contract_url" "text",
    "status" "public"."contract_status" DEFAULT 'draft'::"public"."contract_status",
    "contractor_signed_at" timestamp with time zone,
    "freelancer_signed_at" timestamp with time zone,
    "contractor_signature_name" "text",
    "freelancer_signature_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "official_name" "text",
    "iso2" character(2) NOT NULL,
    "iso3" character(3) NOT NULL,
    "numeric_code" smallint,
    "emoji" "text",
    "continent_id" integer,
    "subregion" "text",
    "official_language" "text",
    "currency_code" "public"."currency_code",
    "currency_name" "text",
    "currency_symbol" "text",
    "phone_code" "text",
    "demonym" "text",
    "region_code" "text",
    "country_group" "text",
    "available" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


ALTER TABLE "public"."countries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."disputes" (
    "id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_by" "uuid",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."disputes" OWNER TO "postgres";


ALTER TABLE "public"."disputes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."disputes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."evidences" (
    "id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_by" "uuid",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."evidences" OWNER TO "postgres";


ALTER TABLE "public"."evidences" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."evidences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."freelancer_profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "freelancer_id" "text" NOT NULL,
    "country" "text" NOT NULL,
    "address" "text" NOT NULL,
    "bio" "text",
    "avatar_url" "text",
    "position" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."freelancer_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."milestones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "percentage" numeric(5,2) NOT NULL,
    "status" "public"."milestone_status" DEFAULT 'pending'::"public"."milestone_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "milestones_percentage_check" CHECK ((("percentage" > (0)::numeric) AND ("percentage" <= (100)::numeric)))
);


ALTER TABLE "public"."milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "project_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_organization" (
    "id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_by" "uuid",
    "deleted_at" timestamp with time zone,
    "organization_id" bigint NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "role" "public"."organization_member_role" NOT NULL,
    "status" "public"."organization_member_status" NOT NULL,
    "joined_at" timestamp with time zone
);


ALTER TABLE "public"."user_organization" OWNER TO "postgres";


ALTER TABLE "public"."user_organization" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."organization_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_by" "uuid",
    "deleted_at" timestamp with time zone,
    "type" "public"."organization_type" NOT NULL,
    "legal_type" "public"."organization_legal_type" NOT NULL,
    "name" "text" NOT NULL,
    "legal_name" "text" NOT NULL,
    "legal_id" "text" NOT NULL,
    "legal_phone" "text",
    "legal_country_id" bigint NOT NULL,
    "bio" "text" NOT NULL,
    "avatar_url" "text",
    "business_type" "public"."organization_business_type" NOT NULL,
    "custom_business_type" "text",
    "industry_type" "public"."organization_industry_type" NOT NULL,
    "custom_industry_type" "text",
    "legal_state" "text" NOT NULL,
    "legal_city" "text" NOT NULL,
    "legal_street_name" "text" NOT NULL,
    "legal_street_number" bigint NOT NULL,
    "legal_postal_code" "text" NOT NULL,
    "legal_suite" "text",
    "legal_floor" "text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."type" IS 'Si la organizacion es del tipo requester entonces envia pagos, y si es del tipo provider entonces recibe pagos';



COMMENT ON COLUMN "public"."organizations"."legal_type" IS 'Si la organizacion es de una persona individual o una empresa';



COMMENT ON COLUMN "public"."organizations"."name" IS 'Nombre de la organizacion';



COMMENT ON COLUMN "public"."organizations"."legal_name" IS 'Nombre legal de la organizacion';



ALTER TABLE "public"."organizations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."organizations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_by" "uuid",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


ALTER TABLE "public"."payments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "contractor_id" "uuid" NOT NULL,
    "freelancer_email" "text" NOT NULL,
    "freelancer_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "responded_at" timestamp with time zone,
    CONSTRAINT "project_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."project_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "contractor_id" "uuid" NOT NULL,
    "freelancer_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "image_url" "text",
    "total_amount" numeric(10,2) NOT NULL,
    "expected_delivery_date" "date" NOT NULL,
    "status" "public"."project_status" DEFAULT 'draft'::"public"."project_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "contract_url" "text",
    "contract_id" "text"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."projects"."contract_id" IS 'Stellar escrow contract ID (account address) for the project';



CREATE TABLE IF NOT EXISTS "public"."projects2" (
    "id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_by" "uuid",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."projects2" OWNER TO "postgres";


ALTER TABLE "public"."projects2" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."projects2_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."continents"
    ADD CONSTRAINT "continents_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."continents"
    ADD CONSTRAINT "continents_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."continents"
    ADD CONSTRAINT "continents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contractor_profiles"
    ADD CONSTRAINT "contractor_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evidences"
    ADD CONSTRAINT "evidences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."freelancer_profiles"
    ADD CONSTRAINT "freelancer_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_organization"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_invitations"
    ADD CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects2"
    ADD CONSTRAINT "projects2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_milestones_project_id" ON "public"."milestones" USING "btree" ("project_id");



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_project_invitations_freelancer_email" ON "public"."project_invitations" USING "btree" ("freelancer_email");



CREATE INDEX "idx_projects_contract_id" ON "public"."projects" USING "btree" ("contract_id");



CREATE INDEX "idx_projects_contractor_id" ON "public"."projects" USING "btree" ("contractor_id");



CREATE INDEX "idx_projects_freelancer_id" ON "public"."projects" USING "btree" ("freelancer_id");



CREATE OR REPLACE TRIGGER "set_continents_updated_fields" AFTER UPDATE ON "public"."continents" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "set_disputes_updated_fields" AFTER UPDATE ON "public"."disputes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "set_evidences_updated_fields" AFTER UPDATE ON "public"."evidences" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "set_organization_members_updated_fields" AFTER UPDATE ON "public"."user_organization" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "set_organizations_updated_fields" AFTER UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "set_payments_updated_fields" AFTER UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "set_projects2_updated_fields" AFTER UPDATE ON "public"."projects2" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_fields"();



CREATE OR REPLACE TRIGGER "update_contractor_profiles_updated_at" BEFORE UPDATE ON "public"."contractor_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contracts_updated_at" BEFORE UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_freelancer_profiles_updated_at" BEFORE UPDATE ON "public"."freelancer_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_milestones_updated_at" BEFORE UPDATE ON "public"."milestones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."contractor_profiles"
    ADD CONSTRAINT "contractor_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_continent_id_fkey" FOREIGN KEY ("continent_id") REFERENCES "public"."continents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."evidences"
    ADD CONSTRAINT "evidences_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."evidences"
    ADD CONSTRAINT "evidences_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."evidences"
    ADD CONSTRAINT "evidences_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."freelancer_profiles"
    ADD CONSTRAINT "freelancer_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_organization"
    ADD CONSTRAINT "organization_members_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_organization"
    ADD CONSTRAINT "organization_members_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_organization"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_organization"
    ADD CONSTRAINT "organization_members_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_organization"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_legal_country_id_fkey" FOREIGN KEY ("legal_country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_invitations"
    ADD CONSTRAINT "project_invitations_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_invitations"
    ADD CONSTRAINT "project_invitations_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_invitations"
    ADD CONSTRAINT "project_invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects2"
    ADD CONSTRAINT "projects2_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."projects2"
    ADD CONSTRAINT "projects2_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."projects2"
    ADD CONSTRAINT "projects2_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Contractors can create invitations" ON "public"."project_invitations" FOR INSERT WITH CHECK (("auth"."uid"() = "contractor_id"));



CREATE POLICY "Contractors can create projects" ON "public"."projects" FOR INSERT WITH CHECK (("auth"."uid"() = "contractor_id"));



CREATE POLICY "Contractors can manage milestones" ON "public"."milestones" USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "milestones"."project_id") AND ("projects"."contractor_id" = "auth"."uid"())))));



CREATE POLICY "Contractors can update their own projects" ON "public"."projects" FOR UPDATE USING (("auth"."uid"() = "contractor_id"));



CREATE POLICY "Contractors can view their own projects" ON "public"."projects" FOR SELECT USING (("auth"."uid"() = "contractor_id"));



CREATE POLICY "Contractors can view their sent invitations" ON "public"."project_invitations" FOR SELECT USING (("auth"."uid"() = "contractor_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_organization" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."continents" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."organizations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_organization" FOR SELECT USING (true);



CREATE POLICY "Enable select for users based on user_id" ON "public"."admins" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Freelancers can update invitation responses" ON "public"."project_invitations" FOR UPDATE USING (("auth"."uid"() = "freelancer_id"));



CREATE POLICY "Freelancers can view assigned projects" ON "public"."projects" FOR SELECT USING (("auth"."uid"() = "freelancer_id"));



CREATE POLICY "Freelancers can view their received invitations" ON "public"."project_invitations" FOR SELECT USING (("auth"."uid"() = "freelancer_id"));



CREATE POLICY "Owners and Admins can update their own organizations" ON "public"."organizations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization" "uo"
  WHERE (("uo"."organization_id" = "organizations"."id") AND ("uo"."user_id" = "auth"."uid"()) AND ("uo"."role" = ANY (ARRAY['owner'::"public"."organization_member_role", 'admin'::"public"."organization_member_role"])) AND ("uo"."deleted_at" IS NULL) AND ("uo"."deleted_by" IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_organization" "uo"
  WHERE (("uo"."organization_id" = "organizations"."id") AND ("uo"."user_id" = "auth"."uid"()) AND ("uo"."role" = ANY (ARRAY['owner'::"public"."organization_member_role", 'admin'::"public"."organization_member_role"])) AND ("uo"."deleted_at" IS NULL) AND ("uo"."deleted_by" IS NULL)))));



CREATE POLICY "Project participants can update contracts" ON "public"."contracts" FOR UPDATE USING ((("auth"."uid"() = "contractor_id") OR ("auth"."uid"() = "freelancer_id")));



CREATE POLICY "Project participants can view contracts" ON "public"."contracts" FOR SELECT USING ((("auth"."uid"() = "contractor_id") OR ("auth"."uid"() = "freelancer_id")));



CREATE POLICY "Project participants can view milestones" ON "public"."milestones" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "milestones"."project_id") AND (("projects"."contractor_id" = "auth"."uid"()) OR ("projects"."freelancer_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert their own contractor profile" ON "public"."contractor_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own freelancer profile" ON "public"."freelancer_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own contractor profile" ON "public"."contractor_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own freelancer profile" ON "public"."freelancer_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own contractor profile" ON "public"."contractor_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own freelancer profile" ON "public"."freelancer_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."continents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_organization" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_user_organizations"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admins_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admins_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admins_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."continents" TO "anon";
GRANT ALL ON TABLE "public"."continents" TO "authenticated";
GRANT ALL ON TABLE "public"."continents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."continents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."continents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."continents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contractor_profiles" TO "anon";
GRANT ALL ON TABLE "public"."contractor_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."contractor_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."disputes" TO "anon";
GRANT ALL ON TABLE "public"."disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."disputes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."disputes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."disputes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."disputes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."evidences" TO "anon";
GRANT ALL ON TABLE "public"."evidences" TO "authenticated";
GRANT ALL ON TABLE "public"."evidences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."evidences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."evidences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."evidences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."freelancer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."freelancer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."freelancer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."milestones" TO "anon";
GRANT ALL ON TABLE "public"."milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."milestones" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."user_organization" TO "anon";
GRANT ALL ON TABLE "public"."user_organization" TO "authenticated";
GRANT ALL ON TABLE "public"."user_organization" TO "service_role";



GRANT ALL ON SEQUENCE "public"."organization_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."organization_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."organization_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."organizations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."organizations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."organizations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_invitations" TO "anon";
GRANT ALL ON TABLE "public"."project_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."project_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."projects2" TO "anon";
GRANT ALL ON TABLE "public"."projects2" TO "authenticated";
GRANT ALL ON TABLE "public"."projects2" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects2_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects2_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects2_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


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



  create policy "Give users access to own folder 1shn069_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'contracts'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Give users access to own folder 1shn069_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'contracts'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Give users access to own folder 1shn069_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'contracts'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Give users access to own folder 1shn069_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'contracts'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Project participants can view contracts"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'contracts'::text) AND (EXISTS ( SELECT 1
   FROM public.contracts c
  WHERE ((c.contract_url ~~ (('%'::text || objects.name) || '%'::text)) AND ((c.contractor_id = auth.uid()) OR (c.freelancer_id = auth.uid())))))));



  create policy "Public read access to organizations"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'organizations'::text));



