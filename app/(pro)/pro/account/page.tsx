import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  ArrowLeft,
  Tag,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getEnrichedProSession } from "@/lib/session";
import { logoutPro } from "@/actions/pro-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

const PRICING_DESC: Record<string, string> = {
  C: "Tarif Niveau C",
  D: "Tarif Niveau D",
  E: "Tarif Niveau E",
  F: "Tarif Niveau F",
};

export default async function ProAccountPage() {
  const session = await getEnrichedProSession();
  if (!session) {
    redirect("/pro/login?next=/pro/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      customer: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          postalCode: true,
          country: true,
          pricingLevel: true,
        },
      },
    },
  });
  if (!user || !user.customer) {
    redirect("/pro/login");
  }
  const c = user.customer;

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
                <Row label="Contact" value={c.contactName} />
                <Row icon={<Tag className="h-4 w-4" />} label="Niveau de tarification" value={c.pricingLevel ? `${c.pricingLevel} — ${PRICING_DESC[c.pricingLevel]}` : "Non assigné"} />
              </Card>

              <Card title="COORDONNÉES">
                <Row icon={<Mail className="h-4 w-4" />} label="E-mail de connexion" value={user.email} />
                {c.email && <Row label="E-mail entreprise" value={c.email} />}
                <Row icon={<Phone className="h-4 w-4" />} label="Téléphone" value={c.phone} />
              </Card>

              <Card title="ADRESSE DE FACTURATION" full>
                <Row icon={<MapPin className="h-4 w-4" />} label="Adresse" value={c.address} />
                <Row label="Ville" value={`${c.postalCode} ${c.city}`} />
                <Row label="Pays" value={c.country} />
              </Card>
            </div>

            <p
              className="mt-6 text-[11.5px]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Pour modifier vos informations professionnelles, contactez votre
              interlocuteur commercial.
            </p>
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
  children,
}: {
  title: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white p-6 ${full ? "col-span-2" : ""}`}
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <div
        className="text-[10.5px] font-bold tracking-[0.16em]"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {title}
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
