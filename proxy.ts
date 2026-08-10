import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/** 未ログインでも到達できるパス */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth"];
/** 公開の入会申込フォーム（Phase 1 で実装） */
const PUBLIC_PREFIXES = ["/join/"];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(`${p}/`)) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

/**
 * Next.js 16 で middleware から改称された Proxy。
 *
 * 役割は2つ。
 *   1. Supabase のセッション cookie を毎リクエスト更新する
 *   2. 未ログインで保護ページに来た人をログインへ飛ばす
 *
 * 認可の判断はここではなく DB の RLS が最終防衛線。Proxy は UX のための
 * 早期リダイレクトに留め、これを認可の根拠にはしない。
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl(),
    env.supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() は Auth サーバーへ問い合わせてトークンを検証する。
  // getSession() は cookie を信用するだけなので、ここでは使わない。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/orgs";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 静的アセットと画像最適化を除く全パス。
     * これらでセッション更新を走らせても意味がなく、負荷になるだけ。
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
