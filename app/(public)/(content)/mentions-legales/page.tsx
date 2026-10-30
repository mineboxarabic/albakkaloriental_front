import { InfoPage, LegalTranslationNote, MailLink } from "@/components/info-page";
import { getCompany } from "@/lib/company";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Mentions légales") };
}

export default async function MentionsLegalesPage() {
  const company = await getCompany();
  const { language } = await getTranslator();
  const email = company.email;
  return (
    <InfoPage title="Mentions légales">
      {language === "ar" ? (
        <>
          <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
            الوثيقة قيد الإعداد.
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            ناشر الموقع: {company.name}
            {company.siret ? (
              <>
                {" "}
                — رقم SIRET <span className="ltr-isolate">{company.siret}</span>
              </>
            ) : null}
            .
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
            لأي سؤال يتعلق بالمعلومات القانونية، تواصل معنا على{" "}
            <MailLink email={email} />.
          </p>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
            Document en cours de rédaction.
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Éditeur du site&nbsp;: {company.name}
            {company.siret ? ` — SIRET ${company.siret}` : ""}.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Pour toute question relative aux mentions légales, contactez-nous à{" "}
            <MailLink email={email} />.
          </p>
        </>
      )}
      <LegalTranslationNote />
    </InfoPage>
  );
}
