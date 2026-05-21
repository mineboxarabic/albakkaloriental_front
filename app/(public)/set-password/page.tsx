import Link from "next/link";
import SetPasswordForm from "./set-password-form";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-2">Lien invalide</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Aucun jeton d&apos;activation n&apos;a été fourni.
        </p>
        <Link href="/pro/login" className="underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-2xl font-semibold mb-2">Définir mon mot de passe</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Bienvenue. Choisissez un mot de passe pour activer votre compte
        professionnel.
      </p>
      <SetPasswordForm token={token} />
    </div>
  );
}
