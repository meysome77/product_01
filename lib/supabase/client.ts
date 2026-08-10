import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/** ブラウザ（Client Component）用の Supabase クライアント */
export function createClient() {
  return createBrowserClient<Database>(
    env.supabaseUrl(),
    env.supabaseAnonKey(),
  );
}
