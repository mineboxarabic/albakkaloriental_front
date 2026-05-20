"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerRetail, type RegisterState } from "@/actions/retail-auth";
import { COLORS } from "@/lib/ui";

const initial: RegisterState = null;

export function RegisterParticulierForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerRetail,
    initial,
  );

  const err = (k: string) => (state && !state.ok ? state.errors[k] : undefined);
  const val = (k: string) =>
    state && !state.ok ? (state.values?.[k] ?? "") : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field name="firstName" label="Prénom" defaultValue={val("firstName")} error={err("firstName")} autoComplete="given-name" />
        <Field name="lastName" label="Nom" defaultValue={val("lastName")} error={err("lastName")} autoComplete="family-name" />
      </div>
      <Field
        name="email"
        label="Adresse e-mail"
        defaultValue={val("email")}
        error={err("email")}
        autoComplete="email"
        placeholder="vous@exemple.com"
        type="email"
      />
      <Field
        name="phone"
        label="Téléphone"
        defaultValue={val("phone")}
        error={err("phone")}
        autoComplete="tel"
        placeholder="06 12 34 56 78"
        type="tel"
      />
      <Field name="city" label="Ville" defaultValue={val("city")} error={err("city")} autoComplete="address-level2" />
      <Field name="address" label="Adresse" defaultValue={val("address")} error={err("address")} autoComplete="street-address" />
      <Field
        name="password"
        label="Mot de passe"
        type="password"
        error={err("password")}
        autoComplete="new-password"
        hint="8 caractères minimum."
      />

      <SubmitButton />

      <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
        En créant votre compte, vous acceptez nos conditions générales de vente.
      </p>
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
      {pending ? "Création..." : "Créer mon compte"}
    </button>
  );
}

function Field({
  name,
  label,
  defaultValue,
  error,
  type = "text",
  autoComplete,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
        style={{
          borderColor: error ? COLORS.red : COLORS.border,
          background: "#FFFFFF",
          color: COLORS.text,
        }}
      />
      {error && (
        <span className="text-[11.5px]" style={{ color: COLORS.red }}>
          {error}
        </span>
      )}
      {!error && hint && (
        <span className="text-[11.5px]" style={{ color: COLORS.muted }}>
          {hint}
        </span>
      )}
    </label>
  );
}
