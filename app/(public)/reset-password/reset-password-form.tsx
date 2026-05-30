"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Lock } from "lucide-react";
import { resetPassword, type ResetPasswordState } from "@/actions/password-reset";
import { COLORS } from "@/lib/ui";

const initial: ResetPasswordState = null;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    resetPassword,
    initial,
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="flex items-start gap-3 rounded-md border-l-4 px-3 py-3 text-[13px]"
          style={{
            background: "#E5F0D9",
            borderColor: COLORS.primary,
            color: "#2E3F17",
          }}
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">Mot de passe mis à jour</div>
            <div className="mt-1">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de
              passe.
            </div>
          </div>
        </div>
        <Link
          href="/login"
          className="grid h-11 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm"
          style={{ background: COLORS.primary }}
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  const err = (k: string) => (state && !state.ok ? state.errors[k] : undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <PasswordField
        name="password"
        label="Nouveau mot de passe"
        error={err("password")}
      />
      <PasswordField
        name="confirmPassword"
        label="Confirmer le mot de passe"
        error={err("confirmPassword")}
      />

      {err("form") && (
        <div
          role="alert"
          className="rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{
            background: "#FCE9E5",
            borderColor: COLORS.red,
            color: "#7A1709",
          }}
        >
          {err("form")}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function PasswordField({
  name,
  label,
  error,
}: {
  name: string;
  label: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
        {label}
      </span>
      <div className="relative">
        <Lock
          className="absolute left-3 top-3 h-4 w-4"
          style={{ color: COLORS.muted }}
          strokeWidth={2}
        />
        <input
          name={name}
          type="password"
          required
          autoComplete="new-password"
          className="h-11 w-full rounded-md border pl-9 pr-3 text-[13.5px] outline-none focus:border-[#3F561F]"
          style={{
            borderColor: error ? COLORS.red : COLORS.border,
            background: "#FFFFFF",
          }}
        />
      </div>
      {error && (
        <span role="alert" className="text-[11.5px]" style={{ color: COLORS.red }}>
          {error}
        </span>
      )}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="grid h-11 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm disabled:opacity-70"
      style={{ background: COLORS.primary }}
    >
      {pending ? "Mise à jour..." : "Définir le mot de passe"}
    </button>
  );
}
