import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProLoginForm } from "./pro-login-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string }>;

function safeNext(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export default async function ProLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  const redirectTo = safeNext(next);
  return (
    <main
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(180deg, #1E2A0E 0%, #2B3B14 60%, #3F561F 100%)",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-5 py-6 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            style={{ color: "rgba(255,255,255,0.85)" }}
            aria-label="Le Bakkal Oriental — accueil"
          >
            <Image
              src="/Assets/img/logo.png"
              alt="Le Bakkal Oriental"
              width={96}
              height={96}
              priority
              className="h-16 w-auto sm:h-20"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span
              className="flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.2em] text-white/85"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
            >
              <Shield className="h-2.5 w-2.5" strokeWidth={2.4} /> PRO
            </span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-semibold"
            style={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.9)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Espace particulier
          </Link>
        </header>

        <div className="grid flex-1 grid-cols-1 items-center gap-10 py-8 lg:grid-cols-12 lg:gap-12 lg:py-12">
          <section className="order-2 text-white lg:order-0 lg:col-span-7 lg:pr-6">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10.5px] font-bold tracking-[0.18em]"
              style={{ borderColor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.95)" }}
            >
              <Shield className="h-3 w-3" strokeWidth={2.2} />
              ESPACE PROFESSIONNEL
            </span>
            <h1
              className="mt-5 text-[30px] font-extrabold leading-[1.05] tracking-tight sm:text-[36px] lg:text-[42px]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Portail B2B
              <br />
              <span style={{ color: "#D9D2BA" }}>Le Bakkal Oriental</span>
            </h1>
            <p
              className="mt-4 max-w-[460px] text-[14px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Accédez à votre catalogue professionnel, vos tarifs négociés, vos
              devis et l&apos;historique de vos commandes.
            </p>

            <div
              className="mt-10 grid max-w-[480px] grid-cols-3 gap-px overflow-hidden rounded-sm border"
              style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)" }}
            >
              <StatTile label="Tarifs paliers" value="C · D · E · F" />
              <StatTile label="Devis" value="Sur demande" />
              <StatTile label="Support" value="Dédié" />
            </div>

            <p
              className="mt-10 max-w-[460px] text-[12px]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Les comptes professionnels sont créés manuellement après
              validation du KBIS. Pour toute demande,{" "}
              <Link
                href="/register/entreprise"
                className="underline-offset-2 hover:underline"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                ouvrir une demande
              </Link>
              .
            </p>
          </section>

          <section className="order-1 lg:order-0 lg:col-span-5">
            <div
              className="rounded-sm border bg-white p-6 sm:p-8"
              style={{
                borderColor: "rgba(255,255,255,0.18)",
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[11px] font-bold tracking-[0.18em]" style={{ color: COLORS.muted }}>
                CONNEXION
              </div>
              <h2
                className="mt-1 text-[19px] font-extrabold tracking-tight sm:text-[22px]"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                Identifiants professionnels
              </h2>
              <div
                className="mt-1 h-0.5 w-12"
                style={{ background: COLORS.primary }}
                aria-hidden
              />

              <div className="mt-6">
                <ProLoginForm redirectTo={redirectTo} />
              </div>

              <div
                className="mt-6 border-t pt-4 text-[11.5px]"
                style={{ borderColor: COLORS.border, color: COLORS.muted }}
              >
                Mot de passe oublié ? Contactez votre interlocuteur commercial.
              </div>
            </div>
          </section>
        </div>

        <footer
          className="mt-auto flex flex-col items-center justify-between gap-3 border-t pt-6 text-center text-[11.5px] sm:flex-row sm:text-left"
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}
        >
          <span>© {new Date().getFullYear()} Le Bakkal Oriental — Espace B2B</span>
          <span className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Mentions légales</a>
            <a href="#" className="hover:text-white">CGV professionnelles</a>
          </span>
        </footer>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-4 py-3"
      style={{ background: "rgba(0,0,0,0.18)" }}
    >
      <div
        className="text-[10px] font-bold tracking-[0.14em]"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {label.toUpperCase()}
      </div>
      <div className="mt-1 text-[13px] font-bold text-white">{value}</div>
    </div>
  );
}
