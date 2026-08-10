/**
 * DB の型定義。
 *
 * Supabase プロジェクトを作成したあとは、以下のコマンドで自動生成に
 * 置き換えられる。スキーマを変更したら再生成すること。
 *
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 *
 * 手書きしている間の注意: supabase-js は各テーブルに Relationships を
 * 要求する。省くとテーブル型が never に落ち、select の結果が
 * すべて never になるため気付きにくい。
 */

export type OrgRole = "owner" | "admin" | "coach" | "guardian" | "member";

/** 承認・予定作成・会費設定ができるロール */
export const MANAGER_ROLES: readonly OrgRole[] = ["owner", "admin"];

export type Organization = {
  id: string;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  updated_at: string;
};

type Timestamps = "created_at" | "updated_at";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | Timestamps> & { id?: string };
        Update: Partial<Omit<Organization, "id" | Timestamps>>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, Timestamps>;
        Update: Partial<Omit<Profile, "id" | Timestamps>>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      memberships: {
        Row: Membership;
        Insert: Omit<Membership, "id" | Timestamps> & { id?: string };
        Update: Partial<Omit<Membership, "id" | "org_id" | Timestamps>>;
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: {
        Args: { p_slug: string; p_name: string };
        Returns: Organization;
      };
      is_org_member: {
        Args: { p_org_id: string };
        Returns: boolean;
      };
      has_org_role: {
        Args: { p_org_id: string; p_roles: OrgRole[] };
        Returns: boolean;
      };
      can_manage_org: {
        Args: { p_org_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      org_role: OrgRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
