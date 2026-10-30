import { InfoPage, LegalTranslationNote, MailLink } from "@/components/info-page";
import { getCompany } from "@/lib/company";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Politique de confidentialité") };
}

export default async function ConfidentialitePage() {
  const company = await getCompany();
  const { language } = await getTranslator();
  return (
    <InfoPage title="Politique de confidentialité">
      {language === "ar" ? (
        <>
          <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
            الوثيقة قيد الإعداد.
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            نجمع بياناتك الشخصية (الاسم، اسم العائلة، البريد الإلكتروني،
            الهاتف، عنوان التوصيل) فقط لمعالجة طلباتك ومتابعة توصيلها، ولا
            نشاركها مع أي طرف ثالث.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
            لممارسة حقوقك وفق اللائحة العامة لحماية البيانات (RGPD) في الاطلاع
            على بياناتك أو تصحيحها أو حذفها، تواصل معنا على{" "}
            <MailLink email={company.email} />.
          </p>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
            Document en cours de rédaction.
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Vos données personnelles (nom, prénom, e-mail, téléphone, adresse de
            livraison) sont collectées uniquement pour traiter vos commandes et
            assurer le suivi de la livraison. Elles ne sont jamais cédées à un
            tiers.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Pour exercer vos droits RGPD (accès, rectification, suppression),
            contactez-nous à <MailLink email={company.email} />.
          </p>
        </>
      )}
      <LegalTranslationNote />
    </InfoPage>
  );
}
