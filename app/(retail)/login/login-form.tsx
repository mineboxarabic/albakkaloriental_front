"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginRetail, type LoginState } from "@/actions/retail-auth";
import { COLORS } from "@/lib/ui";

const initial: LoginState = null;

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginRetail,
    initial,
  );
  const emailVal = state && !state.ok ? (state.values?.identifier ?? "") : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FunField
        icon={<Mail className="h-4 w-4" strokeWidth={2} />}
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={emailVal}
        placeholder="vous@exemple.com"
      />
      <FunField
        icon={<Lock className="h-4 w-4" strokeWidth={2} />}
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state && !state.ok && (
        <div
          className="rounded-xl border-l-4 px-4 py-2.5 text-[12.5px]"
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
      className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full text-[14.5px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      style={{
        background:
          "linear-gradient(135deg, #3F561F 0%, #5A7A2C 50%, #3F561F 100%)",
        boxShadow: "0 6px 18px -6px rgba(63,86,31,0.55)",
      }}
    >
      {pending ? "Connexion..." : "C'est parti !"}
      {!pending && (
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.4}
        />
      )}
    </button>
  );
}

function FunField({
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
    <label className="group flex flex-col gap-1.5">
      <span
        className="flex items-center gap-1.5 text-[12.5px] font-bold"
        style={{ color: COLORS.text }}
      >
        <span style={{ color: COLORS.primary }}>{icon}</span>
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-12 rounded-xl border-2 px-4 text-[14px] outline-none transition focus:border-[#3F561F] focus:shadow-[0_0_0_4px_rgba(63,86,31,0.12)]"
        style={{
          borderColor: COLORS.border,
          background: "#FFFFFF",
          color: COLORS.text,
        }}
      />
    </label>
  );
}
