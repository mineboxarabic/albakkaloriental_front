import Link from "next/link";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-12 pb-16">
      <div className="mx-auto max-w-[480px]">
        <h1
          className="text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Se connecter
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          Accédez à votre compte particulier.
        </p>

        <div
          className="mt-6 rounded-xl border bg-white p-6"
          style={{ borderColor: COLORS.border }}
        >
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: COLORS.muted }}>
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: COLORS.primary }}
          >
            Créer un compte
          </Link>
        </p>
        <p className="mt-2 text-center text-[12px]" style={{ color: COLORS.muted }}>
          Vous êtes un professionnel ?{" "}
          <Link
            href="/pro/login"
            className="font-semibold hover:underline"
            style={{ color: COLORS.primary }}
          >
            Espace pro
          </Link>
        </p>
      </div>
    </main>
  );
}
