"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2 } from "lucide-react";
import { updateProProfile } from "@/actions/pro-me";
import { COLORS } from "@/lib/ui";

export function ProContactForm({
  defaults,
}: {
  defaults: { phone: string; mobilePhone: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [values, setValues] = useState(defaults);

  const onText =
    (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProProfile(values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <DarkField
        label="Téléphone"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={onText("phone")}
        error={errors.phone}
      />
      <DarkField
        label="Mobile (optionnel)"
        name="mobilePhone"
        type="tel"
        value={values.mobilePhone}
        onChange={onText("mobilePhone")}
        error={errors.mobilePhone}
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
          Coordonnées mises à jour.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 self-start rounded-sm border px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:opacity-60"
        style={{ borderColor: "rgba(255,255,255,0.35)" }}
      >
        <Save className="h-3.5 w-3.5" />
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

function DarkField({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[10.5px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
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
