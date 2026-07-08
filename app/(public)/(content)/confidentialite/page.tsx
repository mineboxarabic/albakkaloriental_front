import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <InfoPage title="Politique de confidentialité">
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
        contactez-nous à{" "}
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
