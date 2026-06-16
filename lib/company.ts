const phone = process.env.COMPANY_PHONE ?? "";

function phoneToWaNumber(p: string) {
  return p.replace(/^\+/, "").replace(/\s/g, "");
}

export const company = {
  name: process.env.COMPANY_NAME ?? "Le Bakkal Oriental",
  address: process.env.COMPANY_ADDRESS ?? "",
  city: process.env.COMPANY_CITY ?? "",
  country: process.env.COMPANY_COUNTRY ?? "",
  phone,
  whatsappUrl: phone ? `https://wa.me/${phoneToWaNumber(phone)}` : null,
  email: process.env.COMPANY_EMAIL ?? "",
  siret: process.env.COMPANY_SIRET ?? "",
  vat: process.env.COMPANY_VAT ?? "",
  socials: {
    instagram: process.env.COMPANY_INSTAGRAM_URL || null,
    facebook: process.env.COMPANY_FACEBOOK_URL || null,
    x: process.env.COMPANY_X_URL || null,
    youtube: process.env.COMPANY_YOUTUBE_URL || null,
  },
} as const;
