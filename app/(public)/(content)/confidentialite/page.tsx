import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">
          Politique de confidentialité
        </h1>
        <p className="mb-3 text-sm text-muted-foreground">
          Document en cours de rédaction.
        </p>
        <p className="mb-3 text-sm leading-relaxed">
          Vos données personnelles (nom, prénom, e-mail, téléphone, adresse de
          livraison) sont collectées uniquement pour traiter vos commandes et
          assurer le suivi de la livraison. Elles ne sont jamais cédées à un
          tiers.
        </p>
        <p className="text-sm leading-relaxed">
          Pour exercer vos droits RGPD (accès, rectification, suppression),
          contactez-nous à{" "}
          <a
            href="mailto:support@bakkaloriental.fr"
            className="font-semibold underline"
          >
            support@bakkaloriental.fr
          </a>
          .
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-sm font-semibold underline-offset-2 hover:underline"
            style={{ color: "#3F561F" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
