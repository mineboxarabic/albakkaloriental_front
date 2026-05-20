"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { COLORS } from "@/lib/ui";

const WHATSAPP_NUMBER = "33766301339";

type Fields = {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  address: string;
};

const initial: Fields = {
  firstName: "",
  lastName: "",
  companyName: "",
  phone: "",
  address: "",
};

function isComplete(f: Fields) {
  return (
    f.firstName.trim().length > 0 &&
    f.lastName.trim().length > 0 &&
    f.companyName.trim().length > 0 &&
    f.phone.trim().length >= 8 &&
    f.address.trim().length >= 5
  );
}

function buildMessage(f: Fields) {
  return [
    "Bonjour, je souhaite ouvrir un compte professionnel sur Le Bakkal Oriental.",
    "",
    `Nom : ${f.lastName}`,
    `Prénom : ${f.firstName}`,
    `Entreprise : ${f.companyName}`,
    `Téléphone : ${f.phone}`,
    `Adresse : ${f.address}`,
    "",
    "Je joins mon KBIS à ce message. Merci de me recontacter pour finaliser la création de mon compte.",
  ].join("\n");
}

export function RegisterEntrepriseForm() {
  const [f, setF] = useState<Fields>(initial);
  const valid = isComplete(f);

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(f))}`;

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" name="firstName" value={f.firstName} onChange={update("firstName")} />
        <Field label="Nom" name="lastName" value={f.lastName} onChange={update("lastName")} />
      </div>
      <Field label="Nom de l'entreprise" name="companyName" value={f.companyName} onChange={update("companyName")} />
      <Field label="Téléphone" name="phone" value={f.phone} onChange={update("phone")} type="tel" placeholder="06 12 34 56 78" />
      <Field label="Adresse de l'entreprise" name="address" value={f.address} onChange={update("address")} />

      <a
        href={valid ? waUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!valid}
        onClick={(e) => {
          if (!valid) e.preventDefault();
        }}
        className="mt-2 grid h-12 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm transition disabled:opacity-60"
        style={{
          background: valid ? "#25D366" : "#9CA8B2",
          pointerEvents: valid ? "auto" : "none",
          opacity: valid ? 1 : 0.6,
        }}
      >
        <span className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
          Envoyer mon KBIS via WhatsApp
        </span>
      </a>

      {!valid && (
        <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
          Renseignez tous les champs pour activer le bouton WhatsApp.
        </p>
      )}
      {valid && (
        <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
          Le bouton ouvre WhatsApp avec un message pré-rempli adressé au{" "}
          <strong>+33 7 66 30 13 39</strong>.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
        style={{
          borderColor: COLORS.border,
          background: "#FFFFFF",
          color: COLORS.text,
        }}
      />
    </label>
  );
}
