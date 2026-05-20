import Link from "next/link";
import { User, Building2, ChevronRight } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export default function RegisterChoicePage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-12 pb-16">
      <header className="mx-auto max-w-[720px] text-center">
        <h1
          className="text-[32px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Créer un compte
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>
          Choisissez le type de compte qui vous correspond.
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-[820px] grid-cols-2 gap-4">
        <ChoiceCard
          href="/register/particulier"
          icon={<User className="h-6 w-6" strokeWidth={1.8} />}
          title="Je suis un particulier"
          description="Créez un compte personnel pour commander en quelques clics et suivre vos livraisons."
          cta="Continuer en particulier"
        />
        <ChoiceCard
          href="/register/entreprise"
          icon={<Building2 className="h-6 w-6" strokeWidth={1.8} />}
          title="Je suis une entreprise"
          description="Accès au catalogue professionnel avec tarifs négociés. Validation par notre équipe."
          cta="Continuer en entreprise"
        />
      </div>

      <p className="mt-8 text-center text-[13px]" style={{ color: COLORS.muted }}>
        Vous avez déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: COLORS.primary }}
        >
          Se connecter
        </Link>
      </p>
    </main>
  );
}

function ChoiceCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border bg-white p-6 transition hover:shadow-md"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="grid h-12 w-12 place-items-center rounded-md"
        style={{ background: COLORS.beige, color: COLORS.primary }}
      >
        {icon}
      </div>
      <h2
        className="mt-4 text-[18px] font-bold"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        {title}
      </h2>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed" style={{ color: COLORS.muted }}>
        {description}
      </p>
      <span
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold"
        style={{ color: COLORS.primary }}
      >
        {cta} <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
