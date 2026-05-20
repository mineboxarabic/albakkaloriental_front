import Link from "next/link";
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
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <svg width="28" height="28" viewBox="0 0 34 34" fill="none" aria-hidden>
              <path
                d="M17 4c-3 6-7 9-12 10 1 8 6 14 12 16 6-2 11-8 12-16-5-1-9-4-12-10z"
                fill="#FAF8F2"
              />
              <path
                d="M17 10c-1 3-4 5-7 6 1 4 4 8 7 9 3-1 6-5 7-9-3-1-6-3-7-6z"
                fill={COLORS.primary}
              />
            </svg>
            <div className="leading-tight">
              <div
                className="text-[15px] font-extrabold tracking-tight text-white"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                LE BAKKAL
              </div>
              <div className="text-[8.5px] tracking-[0.35em] text-white/70">
                ORIENTAL · PRO
              </div>
            </div>
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

        <div className="grid flex-1 grid-cols-12 items-center gap-12 py-12">
          <section className="col-span-7 pr-6 text-white">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10.5px] font-bold tracking-[0.18em]"
              style={{ borderColor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.95)" }}
            >
              <Shield className="h-3 w-3" strokeWidth={2.2} />
              ESPACE PROFESSIONNEL
            </span>
            <h1
              className="mt-5 text-[42px] font-extrabold leading-[1.05] tracking-tight"
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

          <section className="col-span-5">
            <div
              className="rounded-sm border bg-white p-8"
              style={{
                borderColor: "rgba(255,255,255,0.18)",
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[11px] font-bold tracking-[0.18em]" style={{ color: COLORS.muted }}>
                CONNEXION
              </div>
              <h2
                className="mt-1 text-[22px] font-extrabold tracking-tight"
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
          className="mt-auto flex items-center justify-between border-t pt-6 text-[11.5px]"
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
