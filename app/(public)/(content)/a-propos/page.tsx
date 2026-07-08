import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Qui sommes-nous",
};

export default function AProposPage() {
  return (
    <InfoPage title="Qui sommes-nous">
      <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        {company.name} est votre épicerie orientale en ligne. Nous sélectionnons
        des produits authentiques et méditerranéens, halal et traditionnels,
        pour vous offrir le goût de l&apos;Orient livré partout en France.
      </p>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: COLORS.text }}>
        Notre catalogue couvre l&apos;épicerie salée et sucrée, les boissons, les
        produits frais, les surgelés et l&apos;hygiène &amp; la maison —
        soigneusement choisis pour leur qualité et leur authenticité.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
        Une question&nbsp;? Écrivez-nous à{" "}
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
