"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginRetail, type LoginState } from "@/actions/retail-auth";
import { COLORS } from "@/lib/ui";

const initial: LoginState = null;

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginRetail,
    initial,
  );

  const phoneVal = state && !state.ok ? (state.values?.phone ?? "") : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
          Téléphone
        </span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          defaultValue={phoneVal}
          placeholder="06 12 34 56 78"
          className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
          style={{
            borderColor: COLORS.border,
            background: "#FFFFFF",
            color: COLORS.text,
          }}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
          Mot de passe
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
          style={{
            borderColor: COLORS.border,
            background: "#FFFFFF",
            color: COLORS.text,
          }}
        />
      </label>

      {state && !state.ok && (
        <div
          className="rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{
            background: "#FCE9E5",
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
      className="grid h-11 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm disabled:opacity-70"
      style={{ background: COLORS.primary }}
    >
      {pending ? "Connexion..." : "Se connecter"}
    </button>
  );
}
