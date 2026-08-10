import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * サーバー（Server Component / Server Action / Route Handler）用のクライアント。
 *
 * anon key を使うため、常に RLS が効いた状態でアクセスする。
 * RLS を迂回したい場面が出てきても service role をここに持ち込まないこと。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabaseUrl(),
    env.supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component からは cookie を書けない。
            // セッションの更新は proxy.ts 側で行われるため無視してよい。
          }
        },
      },
    },
  );
}
