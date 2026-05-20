import Link from "next/link";
import Image from "next/image";
import { Sparkles, Truck, Heart, ChevronRight } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10 pb-16">
      <div
        className="relative mx-auto overflow-hidden rounded-3xl border"
        style={{
          borderColor: COLORS.border,
          background:
            "radial-gradient(120% 80% at 100% 0%, #F0EBDD 0%, #FAF8F2 60%)",
          boxShadow: "0 24px 48px -28px rgba(63,86,31,0.18)",
        }}
      >
        {/* Decorative confetti dots */}
        <Dot color={COLORS.yellow} style={{ top: 60, left: 80, width: 16, height: 16 }} />
        <Dot color={COLORS.red} style={{ top: 120, left: 40, width: 10, height: 10 }} />
        <Dot color={COLORS.primary} style={{ top: 24, left: 280, width: 12, height: 12 }} />
        <Dot color={COLORS.yellow} style={{ bottom: 80, right: 80, width: 14, height: 14 }} />
        <Dot color={COLORS.primary} style={{ bottom: 40, right: 160, width: 8, height: 8 }} />

        <div className="relative grid grid-cols-12 gap-8 px-12 py-12">
          <section className="col-span-7 flex flex-col justify-center pr-4">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold tracking-wide shadow-sm"
              style={{ color: COLORS.primary }}
            >
              <Sparkles className="h-3 w-3" strokeWidth={2.2} />
              CONTENT DE VOUS REVOIR
            </span>
            <h1
              className="mt-4 text-[40px] font-extrabold leading-[1.05] tracking-tight"
              style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
            >
              Bon retour
              <br />
              à la maison <span aria-hidden>🌿</span>
            </h1>
            <p className="mt-3 max-w-[380px] text-[14px] leading-relaxed" style={{ color: COLORS.muted }}>
              Connectez-vous et retrouvez vos produits orientaux préférés en
              quelques clics.
            </p>

            <ul className="mt-8 space-y-3 text-[13px]" style={{ color: COLORS.text }}>
              <Feat icon={<Truck className="h-4 w-4" strokeWidth={2} />}>
                Livraison rapide partout en France
              </Feat>
              <Feat icon={<Heart className="h-4 w-4" strokeWidth={2} />}>
                Vos favoris et adresses sauvegardés
              </Feat>
              <Feat icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}>
                Promotions exclusives chaque semaine
              </Feat>
            </ul>

            <div className="mt-10 hidden md:block">
              <Image
                src="/Assets/img/products.png"
                alt=""
                width={300}
                height={240}
                className="h-auto w-[260px] -translate-x-2 object-contain drop-shadow-md"
              />
            </div>
          </section>

          <section className="col-span-5">
            <div
              className="rounded-2xl border bg-white p-7"
              style={{
                borderColor: COLORS.border,
                boxShadow: "0 12px 32px -20px rgba(0,0,0,0.18)",
              }}
            >
              <h2
                className="text-[22px] font-extrabold tracking-tight"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                Se connecter
              </h2>
              <p className="mt-1 text-[12.5px]" style={{ color: COLORS.muted }}>
                Compte particulier
              </p>

              <div className="mt-6">
                <LoginForm />
              </div>

              <div
                className="mt-5 rounded-xl px-4 py-3 text-center text-[12.5px]"
                style={{ background: COLORS.beige, color: COLORS.text }}
              >
                Pas encore membre ?{" "}
                <Link
                  href="/register"
                  className="font-bold underline-offset-2 hover:underline"
                  style={{ color: COLORS.primary }}
                >
                  Créer un compte
                </Link>
              </div>

              <Link
                href="/pro/login"
                className="mt-3 flex items-center justify-center gap-1 text-[12px]"
                style={{ color: COLORS.muted }}
              >
                Espace professionnel
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Dot({
  color,
  style,
}: {
  color: string;
  style: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className="absolute rounded-full"
      style={{ ...style, background: color, opacity: 0.85 }}
    />
  );
}

function Feat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className="grid h-7 w-7 place-items-center rounded-full"
        style={{ background: "#FFFFFF", color: COLORS.primary, boxShadow: "0 2px 6px -2px rgba(0,0,0,0.08)" }}
      >
        {icon}
      </span>
      {children}
    </li>
  );
}
