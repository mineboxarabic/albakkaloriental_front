import { InfoPage, MailLink } from "@/components/info-page";
import { company } from "@/lib/company";
import {
  MIN_ORDER_EUR,
  FREE_DELIVERY_THRESHOLD_EUR,
  DELIVERY_FEE_EUR,
} from "@/lib/order-rules";
import { getTranslator } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Livraison à domicile") };
}

export default async function LivraisonPage() {
  const { language } = await getTranslator();
  const euro = (n: number) => <span className="ltr-isolate">{n} €</span>;
  const listClass = "mb-4 space-y-2 text-sm leading-relaxed";
  return (
    <InfoPage title="Livraison à domicile">
      {language === "ar" ? (
        <>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            نوصل طلباتك إلى باب بيتك في جميع أنحاء فرنسا. جهّز سلتك واختر موعدك،
            ونحن نتكفل بالباقي.
          </p>
          <ul className={listClass} style={{ color: COLORS.text }}>
            <li>
              <span className="font-semibold">الحد الأدنى للطلب:</span>{" "}
              {euro(MIN_ORDER_EUR)}.
            </li>
            <li>
              <span className="font-semibold">رسوم التوصيل:</span>{" "}
              {euro(DELIVERY_FEE_EUR)}.
            </li>
            <li>
              <span className="font-semibold">توصيل مجاني:</span> ابتداءً من{" "}
              {euro(FREE_DELIVERY_THRESHOLD_EUR)} من المشتريات.
            </li>
          </ul>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            نعلمك بالمواعيد التقريبية عند تأكيد السلة. لأي سؤال عن التوصيل،
            تواصل معنا على <MailLink email={company.supportEmail} />.
          </p>
        </>
      ) : (
        <>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: COLORS.text }}>
            Nous livrons vos commandes partout en France, directement à votre
            domicile. Préparez votre panier, choisissez votre créneau, et nous nous
            occupons du reste.
          </p>
          <ul className={listClass} style={{ color: COLORS.text }}>
            <li>
              <span className="font-semibold">Commande minimum&nbsp;:</span>{" "}
              {MIN_ORDER_EUR} €.
            </li>
            <li>
              <span className="font-semibold">Frais de livraison&nbsp;:</span>{" "}
              {DELIVERY_FEE_EUR} €.
            </li>
            <li>
              <span className="font-semibold">Livraison offerte&nbsp;:</span> dès{" "}
              {FREE_DELIVERY_THRESHOLD_EUR} € d&apos;achat.
            </li>
          </ul>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            Les délais indicatifs vous sont communiqués lors de la validation du
            panier. Pour toute question sur votre livraison, contactez-nous à{" "}
            <MailLink email={company.supportEmail} />.
          </p>
        </>
      )}
    </InfoPage>
  );
}
