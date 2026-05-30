import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Définir un nouveau mot de passe",
};

export default async function ResetPasswordPage({
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
          Aucun jeton n&apos;a été fourni dans le lien.
        </p>
        <Link href="/forgot-password" className="underline">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">
          Nouveau mot de passe
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Choisissez un nouveau mot de passe (8 caractères minimum).
        </p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
