/**
 * ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR MANUALMENTE
 * 
 * Este archivo se genera automáticamente desde tu base de datos de Supabase.
 * Para regenerarlo, ejecuta: pnpm db:types
 * 
 * Generado desde: DB remota (producción - Project: cuxjevqinogjovbbcrwu)
 * Fecha: 2025-11-06T04:11:20.539Z
 * 
 * Modos disponibles:
 *   - pnpm db:types              # Auto-detecta (local si disponible, sino remoto)
 *   - pnpm db:types --local      # Desde DB local (migraciones locales)
 *   - pnpm db:types --remote     # Desde DB remota (producción)
 * 
 * Este archivo contiene los tipos base generados desde Supabase.
 * Para validaciones runtime, usa los esquemas Zod en lib/validations/
 * 
 * Flujo recomendado con migraciones:
 *   1. Crear migración: supabase migration new nombre_migracion
 *   2. Escribir SQL en supabase/migrations/...
 *   3. Aplicar localmente: supabase db reset
 *   4. Generar tipos: pnpm db:types --local
 *   5. Cuando esté listo: aplicar migraciones a producción y ejecutar pnpm db:types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      continents: {
        Row: {
          code: string
          created_at: string
          description: string | null
          emoji: string | null
          id: number
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: number
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      contractor_profiles: {
        Row: {
          address: string
          business_id: string | null
          contractor_type: Database["public"]["Enums"]["contractor_type"]
          country: string
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          individual_id: string | null
          legal_name: string | null
          logo_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address: string
          business_id?: string | null
          contractor_type: Database["public"]["Enums"]["contractor_type"]
          country: string
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          individual_id?: string | null
          legal_name?: string | null
          logo_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string
          business_id?: string | null
          contractor_type?: Database["public"]["Enums"]["contractor_type"]
          country?: string
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          individual_id?: string | null
          legal_name?: string | null
          logo_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_url: string | null
          contractor_id: string
          contractor_signature_name: string | null
          contractor_signed_at: string | null
          created_at: string | null
          freelancer_id: string
          freelancer_signature_name: string | null
          freelancer_signed_at: string | null
          id: string
          project_id: string
          status: Database["public"]["Enums"]["contract_status"] | null
          updated_at: string | null
        }
        Insert: {
          contract_url?: string | null
          contractor_id: string
          contractor_signature_name?: string | null
          contractor_signed_at?: string | null
          created_at?: string | null
          freelancer_id: string
          freelancer_signature_name?: string | null
          freelancer_signed_at?: string | null
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          updated_at?: string | null
        }
        Update: {
          contract_url?: string | null
          contractor_id?: string
          contractor_signature_name?: string | null
          contractor_signed_at?: string | null
          created_at?: string | null
          freelancer_id?: string
          freelancer_signature_name?: string | null
          freelancer_signed_at?: string | null
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          available: boolean
          continent_id: number | null
          country_group: string | null
          created_at: string
          currency_code: Database["public"]["Enums"]["currency_code"] | null
          currency_name: string | null
          currency_symbol: string | null
          demonym: string | null
          emoji: string | null
          id: number
          iso2: string
          iso3: string
          name: string
          numeric_code: number | null
          official_language: string | null
          official_name: string | null
          phone_code: string | null
          region_code: string | null
          subregion: string | null
        }
        Insert: {
          available?: boolean
          continent_id?: number | null
          country_group?: string | null
          created_at?: string
          currency_code?: Database["public"]["Enums"]["currency_code"] | null
          currency_name?: string | null
          currency_symbol?: string | null
          demonym?: string | null
          emoji?: string | null
          id?: number
          iso2: string
          iso3: string
          name: string
          numeric_code?: number | null
          official_language?: string | null
          official_name?: string | null
          phone_code?: string | null
          region_code?: string | null
          subregion?: string | null
        }
        Update: {
          available?: boolean
          continent_id?: number | null
          country_group?: string | null
          created_at?: string
          currency_code?: Database["public"]["Enums"]["currency_code"] | null
          currency_name?: string | null
          currency_symbol?: string | null
          demonym?: string | null
          emoji?: string | null
          id?: number
          iso2?: string
          iso3?: string
          name?: string
          numeric_code?: number | null
          official_language?: string | null
          official_name?: string | null
          phone_code?: string | null
          region_code?: string | null
          subregion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "countries_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          updated_at?: string
          updated_by?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      evidences: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          updated_at?: string
          updated_by?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      freelancer_profiles: {
        Row: {
          address: string
          avatar_url: string | null
          bio: string | null
          country: string
          created_at: string | null
          freelancer_id: string
          full_name: string
          id: string
          position: string
          updated_at: string | null
        }
        Insert: {
          address: string
          avatar_url?: string | null
          bio?: string | null
          country: string
          created_at?: string | null
          freelancer_id: string
          full_name: string
          id: string
          position: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          avatar_url?: string | null
          bio?: string | null
          country?: string
          created_at?: string | null
          freelancer_id?: string
          full_name?: string
          id?: string
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          percentage: number
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          percentage: number
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          percentage?: number
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          project_id: string | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          project_id?: string | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          project_id?: string | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          avatar_url: string | null
          bio: string
          business_type: Database["public"]["Enums"]["organization_business_type"]
          created_at: string
          created_by: string
          custom_business_type: string | null
          custom_industry_type: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: number
          industry_type: Database["public"]["Enums"]["organization_industry_type"]
          legal_city: string
          legal_country_id: number
          legal_floor: string | null
          legal_id: string
          legal_name: string
          legal_phone: string | null
          legal_postal_code: string
          legal_state: string
          legal_street_name: string
          legal_street_number: number
          legal_suite: string | null
          legal_type: Database["public"]["Enums"]["organization_legal_type"]
          name: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
          updated_by: string
        }
        Insert: {
          avatar_url?: string | null
          bio: string
          business_type: Database["public"]["Enums"]["organization_business_type"]
          created_at?: string
          created_by?: string
          custom_business_type?: string | null
          custom_industry_type?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          industry_type: Database["public"]["Enums"]["organization_industry_type"]
          legal_city: string
          legal_country_id: number
          legal_floor?: string | null
          legal_id: string
          legal_name: string
          legal_phone?: string | null
          legal_postal_code: string
          legal_state: string
          legal_street_name: string
          legal_street_number: number
          legal_suite?: string | null
          legal_type: Database["public"]["Enums"]["organization_legal_type"]
          name: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          updated_by?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          business_type?: Database["public"]["Enums"]["organization_business_type"]
          created_at?: string
          created_by?: string
          custom_business_type?: string | null
          custom_industry_type?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          industry_type?: Database["public"]["Enums"]["organization_industry_type"]
          legal_city?: string
          legal_country_id?: number
          legal_floor?: string | null
          legal_id?: string
          legal_name?: string
          legal_phone?: string | null
          legal_postal_code?: string
          legal_state?: string
          legal_street_name?: string
          legal_street_number?: number
          legal_suite?: string | null
          legal_type?: Database["public"]["Enums"]["organization_legal_type"]
          name?: string
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_legal_country_id_fkey"
            columns: ["legal_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          updated_at?: string
          updated_by?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      project_invitations: {
        Row: {
          contractor_id: string
          freelancer_email: string
          freelancer_id: string | null
          id: string
          invited_at: string | null
          project_id: string
          responded_at: string | null
          status: string | null
        }
        Insert: {
          contractor_id: string
          freelancer_email: string
          freelancer_id?: string | null
          id?: string
          invited_at?: string | null
          project_id: string
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          contractor_id?: string
          freelancer_email?: string
          freelancer_id?: string | null
          id?: string
          invited_at?: string | null
          project_id?: string
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          contract_id: string | null
          contract_url: string | null
          contractor_id: string
          created_at: string | null
          description: string
          expected_delivery_date: string
          freelancer_id: string | null
          id: string
          image_url: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          contract_id?: string | null
          contract_url?: string | null
          contractor_id: string
          created_at?: string | null
          description: string
          expected_delivery_date: string
          freelancer_id?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          contract_id?: string | null
          contract_url?: string | null
          contractor_id?: string
          created_at?: string | null
          description?: string
          expected_delivery_date?: string
          freelancer_id?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organization: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          email: string
          id: number
          joined_at: string | null
          organization_id: number
          role: Database["public"]["Enums"]["organization_member_role"]
          status: Database["public"]["Enums"]["organization_member_status"]
          updated_at: string
          updated_by: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          id?: number
          joined_at?: string | null
          organization_id: number
          role: Database["public"]["Enums"]["organization_member_role"]
          status: Database["public"]["Enums"]["organization_member_status"]
          updated_at?: string
          updated_by?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          id?: number
          joined_at?: string | null
          organization_id?: number
          role?: Database["public"]["Enums"]["organization_member_role"]
          status?: Database["public"]["Enums"]["organization_member_status"]
          updated_at?: string
          updated_by?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organizations: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      contract_status: "draft" | "pending_signature" | "signed" | "completed"
      contractor_type: "individual" | "company"
      currency_code:
        | "usd"
        | "cad"
        | "mxn"
        | "bzd"
        | "crc"
        | "usd_sv"
        | "gtq"
        | "hnl"
        | "nio"
        | "pab"
        | "cup"
        | "dop"
        | "htg"
        | "jmd"
        | "ttd"
        | "bsd"
        | "bbd"
        | "xcd"
        | "gyd"
        | "ars"
        | "bob"
        | "brl"
        | "clp"
        | "cop"
        | "usd_ec"
        | "pyg"
        | "pen"
        | "uyu"
        | "ves"
        | "srd"
        | "eur_gf"
        | "eur"
        | "gbp"
        | "chf"
        | "pln"
        | "huf"
        | "dkk"
        | "sek"
        | "nok"
        | "isk"
        | "rub"
        | "try"
        | "bgn"
        | "hrk"
        | "mkd"
        | "rsd"
        | "bam"
        | "mdl"
        | "uah"
        | "byn"
        | "all"
        | "czk"
        | "nzd"
        | "kzt"
        | "amd"
        | "azn"
        | "kwd"
        | "lbp"
        | "gel"
        | "ron"
        | "ils"
        | "xpf"
      milestone_status: "pending" | "in_progress" | "completed"
      notification_type:
        | "project_invitation"
        | "contract_signed"
        | "milestone_completed"
        | "payment_received"
      organization_business_type:
        | "freelance"
        | "agency"
        | "consultant"
        | "creator"
        | "team"
        | "company"
        | "other"
      organization_industry_type:
        | "Technology"
        | "Artificial Intelligence"
        | "Web3 / Finance"
        | "Design / Creative"
        | "Consulting"
        | "Legal Services"
        | "Construction"
        | "Health"
        | "Media Production"
        | "Non Profit / Social"
        | "Manufacturing"
        | "Retail / Ecommerce"
        | "Travel / Hospitality"
        | "Real Estate"
        | "Other"
      organization_legal_type: "individual" | "company"
      organization_member_role: "owner" | "admin" | "member"
      organization_member_status: "active" | "pending"
      organization_type: "requester" | "provider"
      project_status: "draft" | "active" | "completed" | "cancelled"
      user_role: "contractor" | "freelancer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contract_status: ["draft", "pending_signature", "signed", "completed"],
      contractor_type: ["individual", "company"],
      currency_code: [
        "usd",
        "cad",
        "mxn",
        "bzd",
        "crc",
        "usd_sv",
        "gtq",
        "hnl",
        "nio",
        "pab",
        "cup",
        "dop",
        "htg",
        "jmd",
        "ttd",
        "bsd",
        "bbd",
        "xcd",
        "gyd",
        "ars",
        "bob",
        "brl",
        "clp",
        "cop",
        "usd_ec",
        "pyg",
        "pen",
        "uyu",
        "ves",
        "srd",
        "eur_gf",
        "eur",
        "gbp",
        "chf",
        "pln",
        "huf",
        "dkk",
        "sek",
        "nok",
        "isk",
        "rub",
        "try",
        "bgn",
        "hrk",
        "mkd",
        "rsd",
        "bam",
        "mdl",
        "uah",
        "byn",
        "all",
        "czk",
        "nzd",
        "kzt",
        "amd",
        "azn",
        "kwd",
        "lbp",
        "gel",
        "ron",
        "ils",
        "xpf",
      ],
      milestone_status: ["pending", "in_progress", "completed"],
      notification_type: [
        "project_invitation",
        "contract_signed",
        "milestone_completed",
        "payment_received",
      ],
      organization_business_type: [
        "freelance",
        "agency",
        "consultant",
        "creator",
        "team",
        "company",
        "other",
      ],
      organization_industry_type: [
        "Technology",
        "Artificial Intelligence",
        "Web3 / Finance",
        "Design / Creative",
        "Consulting",
        "Legal Services",
        "Construction",
        "Health",
        "Media Production",
        "Non Profit / Social",
        "Manufacturing",
        "Retail / Ecommerce",
        "Travel / Hospitality",
        "Real Estate",
        "Other",
      ],
      organization_legal_type: ["individual", "company"],
      organization_member_role: ["owner", "admin", "member"],
      organization_member_status: ["active", "pending"],
      organization_type: ["requester", "provider"],
      project_status: ["draft", "active", "completed", "cancelled"],
      user_role: ["contractor", "freelancer"],
    },
  },
} as const
