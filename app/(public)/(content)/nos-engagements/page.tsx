import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Nos engagements",
};

export default function NosEngagementsPage() {
  return (
    <InfoPage title="Nos engagements">
      <ul className="mb-4 space-y-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        <li>
          <span className="font-semibold">Authenticité&nbsp;:</span> des
          produits orientaux et méditerranéens sélectionnés avec soin.
        </li>
        <li>
          <span className="font-semibold">Qualité&nbsp;:</span> un contrôle
          rigoureux à la réception et au stockage.
        </li>
        <li>
          <span className="font-semibold">Halal&nbsp;:</span> une offre
          majoritairement halal, clairement identifiée.
        </li>
        <li>
          <span className="font-semibold">Service&nbsp;:</span> une équipe à
          votre écoute et une livraison fiable partout en France.
        </li>
      </ul>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
        Pour en savoir plus, contactez-nous à{" "}
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
