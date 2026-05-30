import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mot de passe oublié",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const isPro = role === "pro";

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Mot de passe oublié</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Saisissez votre adresse e-mail. Si un compte existe, vous recevrez un
          lien de réinitialisation valable 1 heure.
        </p>

        <ForgotPasswordForm />

        <div className="mt-6 text-center">
          <Link
            href={isPro ? "/pro/login" : "/login"}
            className="text-sm font-semibold underline-offset-2 hover:underline"
            style={{ color: "#3F561F" }}
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
