import Link from "next/link";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { RegisterParticulierForm } from "./register-particulier-form";

export default function RegisterParticulierPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-12 pb-16">
      <div className="mx-auto max-w-[520px]">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/register" className="hover:underline">
            ← Retour aux types de compte
          </Link>
        </nav>
        <h1
          className="mt-3 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Créer mon compte particulier
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          Renseignez vos informations pour commander en quelques minutes.
        </p>

        <div
          className="mt-6 rounded-xl border bg-white p-6"
          style={{ borderColor: COLORS.border }}
        >
          <RegisterParticulierForm />
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: COLORS.muted }}>
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: COLORS.primary }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
