import type { OrgRole } from "@/lib/supabase/types";

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "代表者",
  admin: "運営",
  coach: "指導者",
  guardian: "保護者",
  member: "会員",
};
