"use client";

import { useState, useTransition } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { changeProPassword } from "@/actions/pro-me";
import { COLORS } from "@/lib/ui";

export function ProChangePasswordForm() {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onText =
    (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    startTransition(async () => {
      const result = await changeProPassword(values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setSuccess(true);
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    });
  };

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <KeyRound className="h-4 w-4" strokeWidth={2} />
          <span className="text-[12.5px] font-semibold">Mot de passe</span>
          <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            ••••••••
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-sm border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,0.35)" }}
        >
          Changer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <PwField
        label="Mot de passe actuel"
        name="currentPassword"
        value={values.currentPassword}
        onChange={onText("currentPassword")}
        error={errors.currentPassword}
        autoComplete="current-password"
      />
      <PwField
        label="Nouveau mot de passe"
        name="newPassword"
        value={values.newPassword}
        onChange={onText("newPassword")}
        error={errors.newPassword}
        autoComplete="new-password"
      />
      <PwField
        label="Confirmer"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={onText("confirmPassword")}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      {errors.form && (
        <div
          role="alert"
          className="rounded-sm border-l-2 px-3 py-2 text-[12px]"
          style={{ background: "rgba(213,43,20,0.18)", borderColor: COLORS.red, color: "#FFD7D2" }}
        >
          {errors.form}
        </div>
      )}

      {success && (
        <div
          className="flex items-center gap-2 rounded-sm border-l-2 px-3 py-2 text-[12px]"
          style={{ background: "rgba(63,86,31,0.22)", borderColor: COLORS.primary, color: "#D9E5C0" }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mot de passe mis à jour.
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm border px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:opacity-60"
          style={{ borderColor: "rgba(255,255,255,0.35)" }}
        >
          {pending ? "..." : "Enregistrer"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setErrors({});
            setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
          }}
          className="rounded-sm border px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em]"
          style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function PwField({
  label,
  name,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[10.5px] font-bold tracking-[0.12em]"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {label.toUpperCase()}
      </span>
      <input
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        className="h-10 rounded-sm border bg-white/5 px-3 text-[13.5px] text-white outline-none transition focus:border-white/60"
        style={{
          borderColor: error ? COLORS.red : "rgba(255,255,255,0.25)",
        }}
      />
      {error && (
        <span role="alert" className="text-[11px]" style={{ color: "#FFD7D2" }}>
          {error}
        </span>
      )}
    </label>
  );
}
