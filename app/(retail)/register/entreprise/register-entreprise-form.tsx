"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { COLORS } from "@/lib/ui";
import { useLanguage } from "@/components/language-provider";
import type { Language } from "@/lib/language";

const WHATSAPP_NUMBER = "33766301339";

type Fields = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
};

const initial: Fields = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isComplete(f: Fields) {
  return (
    f.firstName.trim().length > 0 &&
    f.lastName.trim().length > 0 &&
    f.companyName.trim().length > 0 &&
    EMAIL_RE.test(f.email.trim()) &&
    f.phone.trim().length >= 8 &&
    f.address.trim().length >= 5
  );
}

function buildMessage(f: Fields, language: Language) {
  if (language === "ar") {
    return [
      "مرحباً، أرغب في فتح حساب مهني على موقع البقال الشرقي.",
      "",
      `الاسم العائلي: ${f.lastName}`,
      `الاسم: ${f.firstName}`,
      `الشركة: ${f.companyName}`,
      `البريد الإلكتروني: ${f.email}`,
      `الهاتف: ${f.phone}`,
      `العنوان: ${f.address}`,
      "",
      "أرفقت مستخرج السجل التجاري (KBIS) مع هذه الرسالة. يرجى التواصل معي لإكمال إنشاء حسابي.",
    ].join("\n");
  }
  return [
    "Bonjour, je souhaite ouvrir un compte professionnel sur Le Bakkal Oriental.",
    "",
    `Nom : ${f.lastName}`,
    `Prénom : ${f.firstName}`,
    `Entreprise : ${f.companyName}`,
    `E-mail : ${f.email}`,
    `Téléphone : ${f.phone}`,
    `Adresse : ${f.address}`,
    "",
    "Je joins mon KBIS à ce message. Merci de me recontacter pour finaliser la création de mon compte.",
  ].join("\n");
}

export function RegisterEntrepriseForm() {
  const { t, language } = useLanguage();
  const [f, setF] = useState<Fields>(initial);
  const valid = isComplete(f);

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(f, language))}`;

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t("Prénom")} name="firstName" value={f.firstName} onChange={update("firstName")} />
        <Field label={t("Nom")} name="lastName" value={f.lastName} onChange={update("lastName")} />
      </div>
      <Field label={t("Nom de l'entreprise")} name="companyName" value={f.companyName} onChange={update("companyName")} />
      <Field label={t("Adresse e-mail")} name="email" value={f.email} onChange={update("email")} type="email" placeholder="contact@entreprise.com" />
      <Field label={t("Téléphone")} name="phone" value={f.phone} onChange={update("phone")} type="tel" placeholder="06 12 34 56 78" />
      <Field label={t("Adresse de l'entreprise")} name="address" value={f.address} onChange={update("address")} />

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
          {t("Envoyer mon KBIS via WhatsApp")}
        </span>
      </a>

      {!valid && (
        <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
          {t("Renseignez tous les champs pour activer le bouton WhatsApp.")}
        </p>
      )}
      {valid && (
        <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
          {t("Le bouton ouvre WhatsApp avec un message pré-rempli adressé au")}{" "}
          <strong className="ltr-isolate">+33 7 66 30 13 39</strong>.
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
