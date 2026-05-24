"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { requestPasswordReset, type ForgotPasswordState } from "@/actions/password-reset";
import { COLORS } from "@/lib/ui";

const initial: ForgotPasswordState = null;

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ForgotPasswordState, FormData>(
    requestPasswordReset,
    initial,
  );

  if (state?.ok && state.sent) {
    return (
      <div
        className="flex items-start gap-3 rounded-md border-l-4 px-3 py-3 text-[13px]"
        style={{ background: "#E5F0D9", borderColor: COLORS.primary, color: "#2E3F17" }}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="font-bold">Mail envoyé</div>
          <div className="mt-1">
            Si un compte est associé à cette adresse, vous recevrez un lien de
            réinitialisation. Pensez à consulter vos courriers indésirables.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
          Adresse e-mail
        </span>
        <div className="relative">
          <Mail
            className="absolute left-3 top-3 h-4 w-4"
            style={{ color: COLORS.muted }}
            strokeWidth={2}
          />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            className="h-11 w-full rounded-md border pl-9 pr-3 text-[13.5px] outline-none focus:border-[#3F561F]"
            style={{ borderColor: COLORS.border, background: "#FFFFFF" }}
          />
        </div>
      </label>

      {state && !state.ok && (
        <div
          role="alert"
          className="rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{ background: "#FCE9E5", borderColor: COLORS.red, color: "#7A1709" }}
        >
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
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
      {pending ? "Envoi..." : "Envoyer le lien"}
    </button>
  );
}
