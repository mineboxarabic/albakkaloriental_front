import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  MapPin,
  Shield,
  LogOut,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { getProMe } from "@/actions/pro-me";
import { logoutPro } from "@/actions/pro-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProContactForm } from "./pro-contact-form";
import { ProChangePasswordForm } from "./pro-change-password-form";
import { getTranslator } from "@/lib/server-language";
import { formatDate, intlLocale } from "@/lib/language";

export const dynamic = "force-dynamic";

export default async function ProAccountPage() {
  const result = await getProMe();
  if (!result.ok) {
    redirect("/pro/login?next=/pro/account");
  }
  const { user, customer: c } = result;

  // Authoritative balance computed server-side from unpaid invoices net of
  // avoirs (not re-derived per order, which can't be split for a shared invoice).
  const remainingToPay = c.outstandingBalance;
  const { t, language } = await getTranslator();

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
            {t("Catalogue pro")}
          </Link>
          <span
            className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10.5px] font-bold tracking-[0.18em] text-white"
            style={{ borderColor: "rgba(255,255,255,0.3)" }}
          >
            <Shield className="h-3 w-3" strokeWidth={2.2} />
            {t("ESPACE PROFESSIONNEL")}
          </span>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <h1
              className="text-[36px] font-extrabold leading-[1.05] tracking-tight text-white"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              <bdi>{c.companyName}</bdi>
            </h1>
            <p
              className="mt-2 text-[13px]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {t("Compte professionnel")} · {c.country}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-sm border sm:grid-cols-2" style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)" }}>
              <Card title={t("ENTREPRISE")}>
                <Row icon={<Building2 className="h-4 w-4" />} label={t("Raison sociale")} value={c.companyName} />
                {c.companyType && <Row label={t("Forme juridique")} value={c.companyType} />}
                <Row label={t("Contact")} value={c.contactName} />
                {(c.managerFirstName || c.managerLastName) && (
                  <Row
                    label={t("Représentant légal")}
                    value={`${c.managerFirstName ?? ""} ${c.managerLastName ?? ""}`.trim()}
                  />
                )}
              </Card>

              <Card title={t("INFORMATIONS LÉGALES (KBIS)")}>
                {c.siret && (
                  <Row icon={<FileText className="h-4 w-4" />} label={t("SIRET")} value={c.siret} ltr />
                )}
                {c.vatNumber && <Row label={t("N° TVA intracom.")} value={c.vatNumber} ltr />}
                {c.shareCapital !== null && c.shareCapital !== undefined && (
                  <Row
                    label={t("Capital social")}
                    value={`${c.shareCapital.toLocaleString(intlLocale(language))} €`}
                    ltr
                  />
                )}
                {c.apeCode && <Row label={t("Code APE")} value={c.apeCode} ltr />}
                {c.rcsCity && <Row label={t("RCS")} value={c.rcsCity} />}
                {c.incorporationDate && (
                  <Row
                    label={t("Date d'immatriculation")}
                    value={formatDate(c.incorporationDate, language, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  />
                )}
                {!c.siret && !c.vatNumber && !c.apeCode && !c.rcsCity && (
                  <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {t("Informations légales non renseignées.")}
                  </div>
                )}
              </Card>

              <Card title={t("COORDONNÉES")} editableLabel={t("ÉDITABLE")}>
                <Row icon={<Mail className="h-4 w-4" />} label={t("E-mail de connexion")} value={user.email} ltr />
                {c.email && <Row label={t("E-mail entreprise")} value={c.email} ltr />}
                <div className="mt-3">
                  <ProContactForm
                    defaults={{ phone: c.phone, mobilePhone: c.mobilePhone ?? "" }}
                  />
                </div>
              </Card>

              <Card title={t("ADRESSE DE FACTURATION")}>
                <Row icon={<MapPin className="h-4 w-4" />} label={t("Adresse")} value={c.address} />
                {c.addressLine2 && <Row label={t("Complément")} value={c.addressLine2} />}
                <Row label={t("Ville")} value={`${c.postalCode} ${c.city}`} />
                <Row label={t("Pays")} value={c.country} />
                <div
                  className="mt-2 text-[11px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {t("Modifications adresse via commercial.")}
                </div>
              </Card>

              <Card title={t("SÉCURITÉ")} full>
                <ProChangePasswordForm />
              </Card>
            </div>
          </div>

          <aside className="md:col-span-4 flex flex-col gap-4">
            <div
              className="rounded-sm border p-5"
              style={{
                borderColor: "rgba(255,255,255,0.18)",
                background:
                  remainingToPay > 0
                    ? "rgba(213,43,20,0.18)"
                    : "rgba(63,86,31,0.22)",
              }}
            >
              <div
                className="text-[10.5px] font-bold tracking-[0.16em]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {t("RESTE À PAYER")}
              </div>
              <div
                className="mt-2 text-[32px] font-extrabold leading-none text-white"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {remainingToPay.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </div>
              <p
                className="mt-2 text-[11.5px]"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {remainingToPay > 0
                  ? t(
                      "Montant restant dû sur l'ensemble de vos commandes. Réglez via votre interlocuteur commercial.",
                    )
                  : t("Toutes vos commandes sont réglées.")}
              </p>
            </div>

            <form action={logoutPro}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-sm border px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.35)" }}
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                {t("Se déconnecter")}
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
  editableLabel,
  children,
}: {
  title: string;
  full?: boolean;
  editableLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white p-6 ${full ? "sm:col-span-2" : ""}`}
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="text-[10.5px] font-bold tracking-[0.16em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {title}
        </div>
        {editableLabel && (
          <span
            className="rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em]"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {editableLabel}
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
  ltr,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  /** Identifiers, e-mails and amounts keep their left-to-right order. */
  ltr?: boolean;
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
        <dd className="mt-1 break-words text-[14px] font-semibold text-white">
          {ltr ? <span className="ltr-isolate">{value}</span> : <bdi>{value}</bdi>}
        </dd>
      </div>
    </div>
  );
}
