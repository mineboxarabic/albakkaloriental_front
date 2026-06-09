"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginRetail, type LoginState } from "@/actions/retail-auth";

const QS = {
  accent: "#3F561F",
  accentText: "#FAF8F2",
  danger: "#D52B14",
  textPrimary: "#171717",
  textSecondary: "#6B665D",
  textMuted: "#9A968C",
  border: "#DDD8CC",
  borderStrong: "#CFC8B8",
  surfaceInput: "#FFFFFF",
} as const;

const MONO = "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace";

const initial: LoginState = null;

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginRetail,
    initial,
  );
  const emailVal = state && !state.ok ? (state.values?.email ?? "") : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        icon={<Mail className="h-3.5 w-3.5" strokeWidth={2} />}
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={emailVal}
        placeholder="vous@exemple.com"
      />
      <Field
        icon={<Lock className="h-3.5 w-3.5" strokeWidth={2} />}
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />

      <Link
        href="/forgot-password"
        className="-mt-1 self-end text-[11px] font-semibold uppercase underline-offset-2 hover:underline"
        style={{ fontFamily: MONO, letterSpacing: "0.08em", color: QS.accent }}
      >
        Mot de passe oublié ?
      </Link>

      {state && !state.ok && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-2.5 text-[12.5px]"
          style={{
            background: "rgba(213,43,20,0.07)",
            borderColor: "rgba(213,43,20,0.4)",
            color: QS.textPrimary,
          }}
        >
          {state.error}
        </div>
      )}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-lg text-[12px] font-semibold uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ fontFamily: MONO, letterSpacing: "0.1em", background: QS.accent, color: QS.accentText }}
    >
      {pending ? "Connexion..." : "Se connecter"}
      {!pending && (
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.2}
        />
      )}
    </button>
  );
}

function Field({
  icon,
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase"
        style={{ fontFamily: MONO, letterSpacing: "0.1em", color: QS.textSecondary }}
      >
        <span style={{ color: QS.accent }}>{icon}</span>
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-12 rounded-lg border px-4 text-[14px] outline-none transition-colors placeholder:text-[#9A968C] focus:border-[#3F561F]"
        style={{
          borderColor: QS.borderStrong,
          background: QS.surfaceInput,
          color: QS.textPrimary,
        }}
      />
    </label>
  );
}
