"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginPro, type ProLoginState } from "@/actions/pro-auth";
import { COLORS } from "@/lib/ui";

const initial: ProLoginState = null;

export function ProLoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState<ProLoginState, FormData>(
    loginPro,
    initial,
  );
  const emailVal = state && !state.ok ? (state.values?.email ?? "") : "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <ProField
        label="Adresse e-mail professionnelle"
        name="email"
        type="email"
        autoComplete="username"
        required
        defaultValue={emailVal}
        placeholder="contact@entreprise.com"
      />
      <ProField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <Link
        href="/forgot-password?role=pro"
        className="-mt-1 self-end text-[11.5px] font-semibold uppercase tracking-[0.1em] underline-offset-2 hover:underline"
        style={{ color: COLORS.primary }}
      >
        Mot de passe oublié ?
      </Link>

      {state && !state.ok && (
        <div
          role="alert"
          className="border-l-4 px-3 py-2 text-[12.5px]"
          style={{
            background: "#FDEEEA",
            borderColor: COLORS.red,
            color: "#7A1709",
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
      className="mt-1 grid h-11 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-70"
      style={{ background: COLORS.primary }}
    >
      {pending ? "Connexion..." : "Accéder au portail"}
    </button>
  );
}

function ProField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
        style={{ color: COLORS.muted }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 border-b-2 bg-transparent px-1 text-[14px] outline-none transition focus:border-[#3F561F]"
        style={{
          borderColor: COLORS.border,
          color: COLORS.text,
        }}
      />
    </label>
  );
}
