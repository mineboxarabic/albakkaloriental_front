import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Conditions générales de vente",
};

export default function CgvPage() {
  return (
    <InfoPage title="Conditions générales de vente">
      <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
        Document en cours de rédaction.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
        Pour toute question relative aux conditions générales de vente,
        contactez le support à l&apos;adresse{" "}
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
