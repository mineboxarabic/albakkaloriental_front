import "server-only";
import { cache } from "react";
import { z } from "zod";
import { backendFetch } from "@/lib/api-client";
import { buildWhatsappUrl, normalizeWhatsappNumber } from "@/lib/whatsapp";

function emailAddress(value: unknown): string | null {
  const parsed = z.string().trim().email().safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function getContact() {
  const fallback = {
    whatsappNumber: normalizeWhatsappNumber(process.env.WHATSAPP_NUMBER),
    email: emailAddress(process.env.COMPANY_EMAIL) ?? "",
  };
  try {
    const contact = await backendFetch<{ whatsappNumber?: unknown; companyEmail?: unknown } | null>(
      "/api/v1/public/contact",
      { auth: "none" },
    );
    return {
      whatsappNumber: normalizeWhatsappNumber(contact?.whatsappNumber) ?? fallback.whatsappNumber,
      email: emailAddress(contact?.companyEmail) ?? fallback.email,
    };
  } catch {
    // Keep the public site usable during backend outages or staggered deployments.
    return fallback;
  }
}

// React cache deduplicates this read within a server render; backendFetch uses no-store.
export const getCompany = cache(async () => {
  const contact = await getContact();
  return {
    name: process.env.COMPANY_NAME ?? "Le Bakkal Oriental",
    address: process.env.COMPANY_ADDRESS ?? "",
    city: process.env.COMPANY_CITY ?? "",
    country: process.env.COMPANY_COUNTRY ?? "",
    phone: process.env.COMPANY_PHONE ?? "",
    whatsappNumber: contact.whatsappNumber,
    whatsappUrl: buildWhatsappUrl(contact.whatsappNumber),
    email: contact.email,
    siret: process.env.COMPANY_SIRET ?? "",
    vat: process.env.COMPANY_VAT ?? "",
    socials: {
      instagram: process.env.COMPANY_INSTAGRAM_URL || null,
      facebook: process.env.COMPANY_FACEBOOK_URL || null,
      x: process.env.COMPANY_X_URL || null,
      youtube: process.env.COMPANY_YOUTUBE_URL || null,
    },
  } as const;
});
