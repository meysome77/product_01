import type { ComponentProps, ReactNode } from "react";

export function Field({
  label,
  name,
  hint,
  errors,
  children,
}: {
  label: string;
  name: string;
  hint?: ReactNode;
  errors?: string[];
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {errors?.length ? (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {errors.join(" / ")}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  className = "",
  invalid = false,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${props.name}-error` : undefined}
      className={`rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/25 ${
        invalid ? "border-red-500" : "border-border-subtle"
      } ${className}`}
      {...props}
    />
  );
}

/** フォーム全体に関わるエラー（認証失敗など） */
export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      {children}
    </p>
  );
}
