"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2 } from "lucide-react";
import { updateRetailProfile } from "@/actions/retail-me";
import { AddressAutocompleteFields } from "@/components/address-autocomplete-fields";
import { COLORS } from "@/lib/ui";

type Defaults = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  postalCode: string;
  address: string;
};

export function AccountEditForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [values, setValues] = useState(defaults);

  const onText = (k: keyof Defaults) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const onAddressChange = (next: { address: string; postalCode: string; city: string }) =>
    setValues((v) => ({
      ...v,
      address: next.address,
      postalCode: next.postalCode,
      city: next.city,
    }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    startTransition(async () => {
      const result = await updateRetailProfile(values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: COLORS.border }}
      >
        <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.muted }}>
          INFORMATIONS PERSONNELLES
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field
            label="Prénom"
            name="firstName"
            value={values.firstName}
            onChange={onText("firstName")}
            error={errors.firstName}
            required
          />
          <Field
            label="Nom"
            name="lastName"
            value={values.lastName}
            onChange={onText("lastName")}
            error={errors.lastName}
            required
          />
        </div>
        <div className="mt-3">
          <Field
            label="Téléphone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={onText("phone")}
            error={errors.phone}
            required
          />
        </div>
      </div>

      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: COLORS.border }}
      >
        <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.muted }}>
          ADRESSE DE LIVRAISON
        </div>
        <div className="mt-4">
          <AddressAutocompleteFields
            defaults={{
              address: values.address,
              postalCode: values.postalCode,
              city: values.city,
            }}
            errors={{
              address: errors.address,
              postalCode: errors.postalCode,
              city: errors.city,
            }}
            onChange={onAddressChange}
          />
        </div>
      </div>

      {errors.form && (
        <div
          role="alert"
          className="rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{ background: "#FCE9E5", borderColor: COLORS.red, color: "#7A1709" }}
        >
          {errors.form}
        </div>
      )}

      {success && (
        <div
          className="flex items-center gap-2 rounded-md border-l-4 px-3 py-2 text-[12.5px]"
          style={{ background: "#E5F0D9", borderColor: COLORS.primary, color: "#2E3F17" }}
        >
          <CheckCircle2 className="h-4 w-4" />
          Informations mises à jour.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm disabled:opacity-70"
        style={{ background: COLORS.primary }}
      >
        <Save className="h-4 w-4" />
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required ? "true" : undefined}
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
    </label>
  );
}
