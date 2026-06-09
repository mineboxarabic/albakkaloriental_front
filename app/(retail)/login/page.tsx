import Link from "next/link";
import Image from "next/image";
import { Truck, Heart, Tag, ChevronRight } from "lucide-react";
import { LoginForm } from "./login-form";

/**
 * "Quantum Systems" design language recolored to the Le Bakkal brand palette:
 * a strong brand-green surface paired with a clean white auth card, mono
 * technical labels (JetBrains Mono), Inter display, flat 8px geometry.
 */
const QS = {
  surface: "#FFFFFF",
  surfacePanel: "#F0EBDD",
  accent: "#3F561F",
  accentText: "#FAF8F2",
  accentTextDim: "rgba(250, 248, 242, 0.72)",
  textPrimary: "#171717",
  textSecondary: "#6B665D",
  textMuted: "#9A968C",
  border: "#DDD8CC",
} as const;

const DISPLAY = "var(--font-inter), 'Inter', system-ui, sans-serif";
const MONO = "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10 pb-16">
      <div
        className="mx-auto overflow-hidden rounded-lg border shadow-[0_18px_44px_-26px_rgba(23,23,23,0.28)]"
        style={{ background: QS.surface, borderColor: QS.border, fontFamily: DISPLAY }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Brand surface */}
          <section
            className="relative flex flex-col justify-between p-10 lg:col-span-7"
            style={{ background: QS.accent, color: QS.accentText }}
          >
            <div>
              <div
                className="flex items-center gap-2 text-[11px] font-semibold uppercase"
                style={{ fontFamily: MONO, letterSpacing: "0.18em", color: QS.accentTextDim }}
              >
                <span style={{ color: QS.accentText }}>ACCÈS CLIENT</span>
                <span>/ PARTICULIER</span>
              </div>

              <h1
                className="mt-5 text-[40px] font-medium leading-[1.05] tracking-tight"
                style={{ color: QS.accentText }}
              >
                Bon retour
                <br />
                à la maison
              </h1>
              <p className="mt-3 max-w-[400px] text-[14px] leading-relaxed" style={{ color: QS.accentTextDim }}>
                Connectez-vous et retrouvez vos produits orientaux préférés en
                quelques clics.
              </p>

              <ul className="mt-9 space-y-3.5">
                <Feature icon={<Truck className="h-4 w-4" strokeWidth={2} />}>
                  Livraison rapide partout en France
                </Feature>
                <Feature icon={<Heart className="h-4 w-4" strokeWidth={2} />}>
                  Vos favoris et adresses sauvegardés
                </Feature>
                <Feature icon={<Tag className="h-4 w-4" strokeWidth={2} />}>
                  Promotions exclusives chaque semaine
                </Feature>
              </ul>
            </div>

            <div className="mt-10 hidden md:block">
              <Image
                src="/Assets/img/products.png"
                alt=""
                width={300}
                height={240}
                className="h-auto w-[240px] object-contain"
              />
            </div>
          </section>

          {/* Auth card */}
          <section className="flex flex-col justify-center p-8 lg:col-span-5">
            <div
              className="text-[11px] font-semibold uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.16em", color: QS.accent }}
            >
              Connexion
            </div>
            <h2
              className="mt-2 text-[26px] font-medium leading-tight tracking-tight"
              style={{ color: QS.textPrimary }}
            >
              Se connecter
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: QS.textSecondary }}>
              Accédez à votre compte particulier.
            </p>

            <div className="mt-7">
              <LoginForm />
            </div>

            <div
              className="mt-6 rounded-lg border px-4 py-3 text-center text-[12.5px]"
              style={{ background: QS.surfacePanel, borderColor: QS.border, color: QS.textPrimary }}
            >
              Pas encore membre ?{" "}
              <Link
                href="/register"
                className="font-semibold underline-offset-2 hover:underline"
                style={{ color: QS.accent }}
              >
                Créer un compte
              </Link>
            </div>

            <Link
              href="/pro/login"
              className="mt-3 flex items-center justify-center gap-1 text-[11px] font-semibold uppercase transition-opacity hover:opacity-80"
              style={{ fontFamily: MONO, letterSpacing: "0.1em", color: QS.textMuted }}
            >
              Espace professionnel
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-[13px]" style={{ color: QS.accentText }}>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ background: "rgba(250,248,242,0.12)", color: QS.accentText }}
      >
        {icon}
      </span>
      {children}
    </li>
  );
}
