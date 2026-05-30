"use client";

import { useState, useTransition } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { changeRetailPassword } from "@/actions/retail-me";
import { COLORS } from "@/lib/ui";

export function ChangePasswordForm() {
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
      const result = await changeRetailPassword(values);
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
      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: COLORS.border }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="grid h-9 w-9 place-items-center rounded-md"
              style={{ background: COLORS.beige, color: COLORS.primary }}
            >
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[14px] font-semibold" style={{ color: COLORS.text }}>
                Mot de passe
              </div>
              <div className="text-[11.5px]" style={{ color: COLORS.muted }}>
                ••••••••
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md border px-4 py-2 text-[12.5px] font-semibold"
            style={{ borderColor: COLORS.border, color: COLORS.text }}
          >
            Changer le mot de passe
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border bg-white p-6"
      style={{ borderColor: COLORS.border }}
    >
      <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.muted }}>
        CHANGER LE MOT DE PASSE
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Field
          label="Mot de passe actuel"
          name="currentPassword"
          value={values.currentPassword}
          onChange={onText("currentPassword")}
          error={errors.currentPassword}
          autoComplete="current-password"
        />
        <Field
          label="Nouveau mot de passe"
          name="newPassword"
          value={values.newPassword}
          onChange={onText("newPassword")}
          error={errors.newPassword}
          autoComplete="new-password"
          hint="8 caractères minimum."
        />
        <Field
          label="Confirmer le nouveau mot de passe"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={onText("confirmPassword")}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      {errors.form && (
        <div
          role="alert"
          className="mt-3 rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{ background: "#FCE9E5", borderColor: COLORS.red, color: "#7A1709" }}
        >
          {errors.form}
        </div>
      )}

      {success && (
        <div
          className="mt-3 flex items-center gap-2 rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{ background: "#E5F0D9", borderColor: COLORS.primary, color: "#2E3F17" }}
        >
          <CheckCircle2 className="h-4 w-4" />
          Mot de passe mis à jour.
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm disabled:opacity-70"
          style={{ background: COLORS.primary }}
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setErrors({});
            setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
          }}
          className="rounded-md border px-5 py-2.5 text-[13px] font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.text }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
        {label}
      </span>
      <input
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        required
        aria-required="true"
        autoComplete={autoComplete}
        className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
        style={{
          borderColor: error ? COLORS.red : COLORS.border,
          background: "#FFFFFF",
          color: COLORS.text,
        }}
      />
      {error && (
        <span role="alert" className="text-[11.5px]" style={{ color: COLORS.red }}>
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
