import Link from "next/link";
import { submitVerifyEmail } from "@/actions/verify-email";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
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
        <Link href="/login" className="underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  const result = await submitVerifyEmail(token);

  if (result.ok) {
    return (
      <div className="mx-auto max-w-md py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-emerald-700">
          Email confirmé
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Votre adresse a été vérifiée. Vous pouvez maintenant vous connecter.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-2 text-red-700">
        Vérification impossible
      </h1>
      <p className="text-sm text-muted-foreground mb-6">{result.error}</p>
      <Link href="/login" className="underline">
        Retour à la connexion
      </Link>
    </div>
  );
}
