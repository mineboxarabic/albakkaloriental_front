import { Mail, MessageCircle, MapPin, Phone } from "lucide-react";
import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";
import { getTranslator } from "@/lib/server-language";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Contact") };
}

export default async function ContactPage() {
  const { t } = await getTranslator();
  return (
    <InfoPage title="Contact">
      <p className="mb-6 text-sm" style={{ color: COLORS.muted }}>
        {t(
          "Une question, une commande, une suggestion ? Choisissez le canal qui vous convient le mieux.",
        )}
      </p>

      <div className="space-y-3">
        <a
          href={`mailto:${company.email}`}
          className="flex items-start gap-3 rounded-md border bg-[#FAF8F2] px-4 py-3 transition hover:bg-[#F0EBDD]"
        >
          <Mail className="mt-0.5 h-5 w-5 text-[#3F561F]" />
          <div className="flex-1 text-sm">
            <div className="font-semibold" style={{ color: COLORS.text }}>{t("Email")}</div>
            <div style={{ color: COLORS.muted }}>
              <span className="ltr-isolate break-all">{company.email}</span>
            </div>
          </div>
        </a>

        {company.phone && (
          <a
            href={`tel:${company.phone}`}
            className="flex items-start gap-3 rounded-md border bg-[#FAF8F2] px-4 py-3 transition hover:bg-[#F0EBDD]"
          >
            <Phone className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold" style={{ color: COLORS.text }}>{t("Téléphone")}</div>
              <div style={{ color: COLORS.muted }}>
                <span className="ltr-isolate">{company.phone}</span>
              </div>
            </div>
          </a>
        )}

        {company.whatsappUrl && (
          <a
            href={company.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-md border bg-[#E5F0D9] px-4 py-3 transition hover:bg-[#D9E5C0]"
          >
            <MessageCircle className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold" style={{ color: COLORS.text }}>
                {t("WhatsApp (commercial pro)")}
              </div>
              <div style={{ color: COLORS.muted }}>
                <span className="ltr-isolate">{company.phone}</span>
              </div>
            </div>
          </a>
        )}

        {company.address && (
          <div className="flex items-start gap-3 rounded-md border px-4 py-3">
            <MapPin className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold" style={{ color: COLORS.text }}>{t("Adresse")}</div>
              <div style={{ color: COLORS.muted }}>
                <bdi>
                  {company.name} — {company.address}, {company.city},{" "}
                  {company.country}
                </bdi>
              </div>
            </div>
          </div>
        )}
      </div>
    </InfoPage>
  );
}
