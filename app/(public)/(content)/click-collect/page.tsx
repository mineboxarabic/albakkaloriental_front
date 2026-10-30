import { InfoPage, MailLink } from "@/components/info-page";
import { getCompany } from "@/lib/company";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Click & Collect") };
}

export default async function ClickCollectPage() {
  const company = await getCompany();
  const { language } = await getTranslator();
  const listClass = "mb-4 list-decimal space-y-2 ps-5 text-sm leading-relaxed";
  return (
    <InfoPage title="Click & Collect">
      {language === "ar" ? (
        <>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            اطلب عبر الإنترنت واستلم سلتك من المتجر دون رسوم توصيل. خيار مثالي
            إذا كنت قريباً منا.
          </p>
          <ol className={listClass} style={{ color: COLORS.text }}>
            <li>أضف منتجاتك إلى السلة.</li>
            <li>اختر الاستلام من المتجر عند تأكيد الطلب.</li>
            <li>يصلك تأكيد الطلب مع موعد الاستلام.</li>
            <li>تفضّل إلى المتجر في الموعد المحدد.</li>
          </ol>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            لأي سؤال عن الاستلام، تواصل معنا على{" "}
            <MailLink email={company.email} />.
          </p>
        </>
      ) : (
        <>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Commandez en ligne et venez retirer votre panier en magasin, sans frais
            de livraison. Idéal si vous passez dans le quartier.
          </p>
          <ol className={listClass} style={{ color: COLORS.text }}>
            <li>Ajoutez vos produits au panier.</li>
            <li>Choisissez le retrait en magasin lors du checkout.</li>
            <li>
              Recevez la confirmation de votre commande avec le créneau de retrait.
            </li>
            <li>Présentez-vous en magasin à l&apos;heure indiquée.</li>
          </ol>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            Pour toute question sur votre retrait, contactez-nous à{" "}
            <MailLink email={company.email} />.
          </p>
        </>
      )}
    </InfoPage>
  );
}
