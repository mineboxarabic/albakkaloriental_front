import Link from "next/link";

export const metadata = {
  title: "Conditions générales de vente",
};

export default function CgvPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">
          Conditions générales de vente
        </h1>
        <p className="mb-3 text-sm text-muted-foreground">
          Document en cours de rédaction.
        </p>
        <p className="text-sm leading-relaxed">
          Pour toute question relative aux conditions générales de vente,
          contactez le support à l&apos;adresse{" "}
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
