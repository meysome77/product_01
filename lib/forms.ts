import { flattenError, type ZodError } from "zod";

/** Server Action がフォームへ返す状態 */
export type FormState = {
  /** フォーム全体のエラー（認証失敗、DB エラーなど） */
  error?: string;
  /** 入力欄ごとのエラー */
  fieldErrors?: Record<string, string[]>;
  /** 完了メッセージ */
  message?: string;
};

export function toFieldErrors(error: ZodError): FormState {
  return { fieldErrors: flattenError(error).fieldErrors as Record<string, string[]> };
}

/**
 * リダイレクト先として安全なパスだけを通す。
 *
 * `?next=` にそのまま従うと `//evil.example` のような値で
 * 外部サイトへ飛ばせてしまう（オープンリダイレクト）。
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}
