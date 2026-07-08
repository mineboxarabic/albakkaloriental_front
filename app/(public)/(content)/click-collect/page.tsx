import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Click & Collect",
};

export default function ClickCollectPage() {
  return (
    <InfoPage title="Click & Collect">
      <p className="mb-4 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        Commandez en ligne et venez retirer votre panier en magasin, sans frais
        de livraison. Idéal si vous passez dans le quartier.
      </p>

      <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        <li>Ajoutez vos produits au panier.</li>
        <li>Choisissez le retrait en magasin lors du checkout.</li>
        <li>
          Recevez la confirmation de votre commande avec le créneau de retrait.
        </li>
        <li>Présentez-vous en magasin à l&apos;heure indiquée.</li>
      </ol>

      <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
        Pour toute question sur votre retrait, contactez-nous à{" "}
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
