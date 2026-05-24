import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  MapPin,
  Shield,
  LogOut,
  ArrowLeft,
  Tag,
  FileText,
} from "lucide-react";
import { getProMe } from "@/actions/pro-me";
import { logoutPro } from "@/actions/pro-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProContactForm } from "./pro-contact-form";
import { ProChangePasswordForm } from "./pro-change-password-form";

export const dynamic = "force-dynamic";

const PRICING_DESC: Record<string, string> = {
  C: "Tarif Niveau C",
  D: "Tarif Niveau D",
  E: "Tarif Niveau E",
  F: "Tarif Niveau F",
};

export default async function ProAccountPage() {
  const result = await getProMe();
  if (!result.ok) {
    redirect("/pro/login?next=/pro/account");
  }
  const { user, customer: c } = result;

  return (
    <main
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(180deg, #1E2A0E 0%, #2B3B14 60%, #3F561F 100%)",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <Link
            href="/pro/products"
            className="flex items-center gap-2 text-[12px] font-semibold"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Catalogue pro
          </Link>
          <span
            className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10.5px] font-bold tracking-[0.18em] text-white"
            style={{ borderColor: "rgba(255,255,255,0.3)" }}
          >
            <Shield className="h-3 w-3" strokeWidth={2.2} />
            ESPACE PROFESSIONNEL
          </span>
        </header>

        <section className="mt-10 grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <h1
              className="text-[36px] font-extrabold leading-[1.05] tracking-tight text-white"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {c.companyName}
            </h1>
            <p
              className="mt-2 text-[13px]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Compte professionnel · {c.country}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border" style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)" }}>
              <Card title="ENTREPRISE">
                <Row icon={<Building2 className="h-4 w-4" />} label="Raison sociale" value={c.companyName} />
                {c.companyType && <Row label="Forme juridique" value={c.companyType} />}
                <Row label="Contact" value={c.contactName} />
                {(c.managerFirstName || c.managerLastName) && (
                  <Row
                    label="Représentant légal"
                    value={`${c.managerFirstName ?? ""} ${c.managerLastName ?? ""}`.trim()}
                  />
                )}
                <Row icon={<Tag className="h-4 w-4" />} label="Niveau de tarification" value={c.pricingLevel ? `${c.pricingLevel} — ${PRICING_DESC[c.pricingLevel]}` : "Non assigné"} />
              </Card>

              <Card title="INFORMATIONS LÉGALES (KBIS)">
                {c.siret && (
                  <Row icon={<FileText className="h-4 w-4" />} label="SIRET" value={c.siret} />
                )}
                {c.vatNumber && <Row label="N° TVA intracom." value={c.vatNumber} />}
                {c.shareCapital !== null && c.shareCapital !== undefined && (
                  <Row label="Capital social" value={`${c.shareCapital.toLocaleString("fr-FR")} €`} />
                )}
                {c.apeCode && <Row label="Code APE" value={c.apeCode} />}
                {c.rcsCity && <Row label="RCS" value={c.rcsCity} />}
                {c.incorporationDate && (
                  <Row
                    label="Date d'immatriculation"
                    value={new Date(c.incorporationDate).toLocaleDateString("fr-FR")}
                  />
                )}
                {!c.siret && !c.vatNumber && !c.apeCode && !c.rcsCity && (
                  <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Informations légales non renseignées.
                  </div>
                )}
              </Card>

              <Card title="COORDONNÉES" editable>
                <Row icon={<Mail className="h-4 w-4" />} label="E-mail de connexion" value={user.email} />
                {c.email && <Row label="E-mail entreprise" value={c.email} />}
                <div className="mt-3">
                  <ProContactForm
                    defaults={{ phone: c.phone, mobilePhone: c.mobilePhone ?? "" }}
                  />
                </div>
              </Card>

              <Card title="ADRESSE DE FACTURATION">
                <Row icon={<MapPin className="h-4 w-4" />} label="Adresse" value={c.address} />
                {c.addressLine2 && <Row label="Complément" value={c.addressLine2} />}
                <Row label="Ville" value={`${c.postalCode} ${c.city}`} />
                <Row label="Pays" value={c.country} />
                <div
                  className="mt-2 text-[11px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Modifications adresse via commercial.
                </div>
              </Card>

              <Card title="SÉCURITÉ" full>
                <ProChangePasswordForm />
              </Card>
            </div>
          </div>

          <aside className="col-span-4 flex flex-col gap-4">
            <div
              className="rounded-sm border bg-white p-5"
              style={{ borderColor: "rgba(255,255,255,0.18)" }}
            >
              <div
                className="text-[10.5px] font-bold tracking-[0.16em]"
                style={{ color: COLORS.muted }}
              >
                NIVEAU DE TARIFICATION
              </div>
              <div
                className="mt-2 text-[56px] font-extrabold leading-none"
                style={{ color: COLORS.primary, fontFamily: DISPLAY_FONT }}
              >
                {c.pricingLevel ?? "—"}
              </div>
              <p className="mt-2 text-[12px]" style={{ color: COLORS.muted }}>
                Vos prix sont calculés selon ce niveau pour tous les produits du
                catalogue professionnel.
              </p>
            </div>

            <form action={logoutPro}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-sm border px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.35)" }}
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Se déconnecter
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  full,
  editable,
  children,
}: {
  title: string;
  full?: boolean;
  editable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white p-6 ${full ? "col-span-2" : ""}`}
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="text-[10.5px] font-bold tracking-[0.16em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {title}
        </div>
        {editable && (
          <span
            className="rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em]"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            ÉDITABLE
          </span>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3">{children}</dl>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm"
          style={{ background: "rgba(255,255,255,0.08)", color: "#D9D2BA" }}
        >
          {icon}
        </div>
      )}
      <div className="leading-tight">
        <dt
          className="text-[10.5px] font-bold tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {label}
        </dt>
        <dd className="mt-1 text-[14px] font-semibold text-white">{value}</dd>
      </div>
    </div>
  );
}
