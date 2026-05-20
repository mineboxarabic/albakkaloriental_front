import Link from "next/link";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { RegisterEntrepriseForm } from "./register-entreprise-form";

export default function RegisterEntreprisePage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-12 pb-16">
      <div className="mx-auto max-w-[640px]">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/register" className="hover:underline">
            ← Retour aux types de compte
          </Link>
        </nav>
        <h1
          className="mt-3 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Demande de compte professionnel
        </h1>
        <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: COLORS.muted }}>
          Remplissez ce formulaire puis envoyez-nous votre <strong>KBIS</strong> via
          WhatsApp. Notre équipe valide votre dossier et crée vos identifiants
          professionnels manuellement.
        </p>

        <div
          className="mt-6 rounded-xl border bg-white p-6"
          style={{ borderColor: COLORS.border }}
        >
          <RegisterEntrepriseForm />
        </div>

        <div
          className="mt-6 rounded-lg border-l-4 p-4 text-[12.5px] leading-relaxed"
          style={{
            background: COLORS.beige,
            borderColor: COLORS.primary,
            color: COLORS.text,
          }}
        >
          <strong>Comment ça marche :</strong>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Renseignez vos informations ci-dessus.</li>
            <li>Cliquez sur le bouton WhatsApp — un message rédigé s&apos;ouvrira.</li>
            <li>Joignez votre KBIS (PDF ou photo) et envoyez-nous le message.</li>
            <li>Nous vous recontactons sous 24 à 48&nbsp;h avec vos identifiants.</li>
          </ol>
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: COLORS.muted }}>
          Vous avez déjà un compte pro ?{" "}
          <Link
            href="/pro/login"
            className="font-semibold hover:underline"
            style={{ color: COLORS.primary }}
          >
            Se connecter à l&apos;espace pro
          </Link>
        </p>
      </div>
    </main>
  );
}
