import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <InfoPage title="Mentions légales">
      <p className="mb-3 text-sm" style={{ color: COLORS.muted }}>
        Document en cours de rédaction.
      </p>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        Éditeur du site&nbsp;: {company.name}
        {company.siret ? ` — SIRET ${company.siret}` : ""}.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
        Pour toute question relative aux mentions légales, contactez-nous à{" "}
        <a
          href={`mailto:${company.email || company.supportEmail}`}
          className="font-semibold underline"
        >
          {company.email || company.supportEmail}
        </a>
        .
      </p>
    </InfoPage>
  );
}
