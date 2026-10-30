import { InfoPage, MailLink } from "@/components/info-page";
import { getCompany } from "@/lib/company";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Qui sommes-nous") };
}

export default async function AProposPage() {
  const company = await getCompany();
  const { language } = await getTranslator();
  const email = company.email;
  return (
    <InfoPage title="Qui sommes-nous">
      {language === "ar" ? (
        <>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            {company.name} هو متجرك الإلكتروني للبقالة الشرقية. نختار منتجات
            أصيلة ومتوسطية، حلال وتقليدية، لنوصل إليك طعم الشرق في جميع أنحاء
            فرنسا.
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            يضم كتالوجنا البقالة المالحة والحلوة والمشروبات والمنتجات الطازجة
            والمجمدة ومستلزمات المنزل والنظافة، وكلها مختارة بعناية لجودتها
            وأصالتها.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            لديك سؤال؟ راسلنا على <MailLink email={email} />.
          </p>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            {company.name} est votre épicerie orientale en ligne. Nous sélectionnons
            des produits authentiques et méditerranéens, halal et traditionnels,
            pour vous offrir le goût de l&apos;Orient livré partout en France.
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Notre catalogue couvre l&apos;épicerie salée et sucrée, les boissons, les
            produits frais, les surgelés et l&apos;hygiène &amp; la maison —
            soigneusement choisis pour leur qualité et leur authenticité.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            Une question&nbsp;? Écrivez-nous à <MailLink email={email} />.
          </p>
        </>
      )}
    </InfoPage>
  );
}
