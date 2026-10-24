import { InfoPage, LegalTranslationNote, MailLink } from "@/components/info-page";
import { company } from "@/lib/company";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Conditions générales de vente") };
}

export default async function CgvPage() {
  const { language } = await getTranslator();
  return (
    <InfoPage title="Conditions générales de vente">
      {language === "ar" ? (
        <>
          <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
            الوثيقة قيد الإعداد.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
            لأي سؤال يتعلق بشروط البيع العامة، تواصل مع الدعم على{" "}
            <MailLink email={company.supportEmail} />.
          </p>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
            Document en cours de rédaction.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Pour toute question relative aux conditions générales de vente,
            contactez le support à l&apos;adresse{" "}
            <MailLink email={company.supportEmail} />.
          </p>
        </>
      )}
      <LegalTranslationNote />
    </InfoPage>
  );
}
