import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import {
  MIN_ORDER_EUR,
  FREE_DELIVERY_THRESHOLD_EUR,
  DELIVERY_FEE_EUR,
} from "@/lib/order-rules";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Livraison à domicile",
};

export default function LivraisonPage() {
  return (
    <InfoPage title="Livraison à domicile">
      <p className="mb-4 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        Nous livrons vos commandes partout en France, directement à votre
        domicile. Préparez votre panier, choisissez votre créneau, et nous nous
        occupons du reste.
      </p>

      <ul className="mb-4 space-y-2 text-sm leading-relaxed" style={{ color: COLORS.text }}>
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
        <a
          href={`mailto:${company.supportEmail}`}
          className="font-semibold underline"
        >
          {company.supportEmail}
        </a>
        .
      </p>
    </InfoPage>
  );
}
