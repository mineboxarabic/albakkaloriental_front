import { InfoPage, MailLink } from "@/components/info-page";
import { company } from "@/lib/company";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Nos engagements") };
}

const ENGAGEMENTS = {
  fr: [
    ["Authenticité", "des produits orientaux et méditerranéens sélectionnés avec soin."],
    ["Qualité", "un contrôle rigoureux à la réception et au stockage."],
    ["Halal", "une offre majoritairement halal, clairement identifiée."],
    ["Service", "une équipe à votre écoute et une livraison fiable partout en France."],
  ],
  ar: [
    ["الأصالة", "منتجات شرقية ومتوسطية مختارة بعناية."],
    ["الجودة", "رقابة صارمة عند الاستلام وخلال التخزين."],
    ["حلال", "معظم منتجاتنا حلال ومحددة بوضوح."],
    ["الخدمة", "فريق في خدمتك وتوصيل موثوق في جميع أنحاء فرنسا."],
  ],
} as const;

export default async function NosEngagementsPage() {
  const { language } = await getTranslator();
  return (
    <InfoPage title="Nos engagements">
      <ul className="mb-4 space-y-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        {ENGAGEMENTS[language].map(([title, text]) => (
          <li key={title}>
            <span className="font-semibold">
              {title}
              {language === "ar" ? ":" : " :"}
            </span>{" "}
            {text}
          </li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
        {language === "ar"
          ? "لمعرفة المزيد، تواصل معنا على"
          : "Pour en savoir plus, contactez-nous à"}{" "}
        <MailLink email={company.supportEmail} />.
      </p>
    </InfoPage>
  );
}
