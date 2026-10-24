import Link from "next/link";
import { submitVerifyEmail } from "@/actions/verify-email";
import { getTranslator } from "@/lib/server-language";
import { StandaloneLanguageBar } from "@/components/standalone-language-bar";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { t } = await getTranslator();

  if (!token) {
    return (
      <>
        <StandaloneLanguageBar />
        <div className="mx-auto max-w-md py-16 px-4 text-center">
          <h1 className="text-2xl font-semibold mb-2">{t("Lien invalide")}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {t("Aucun jeton n'a été fourni dans le lien.")}
          </p>
          <Link href="/login" className="underline">
            {t("Retour à la connexion")}
          </Link>
        </div>
      </>
    );
  }

  const result = await submitVerifyEmail(token);

  if (result.ok) {
    return (
      <>
        <StandaloneLanguageBar />
        <div className="mx-auto max-w-md py-16 px-4 text-center">
          <h1 className="text-2xl font-semibold mb-2 text-emerald-700">
            {t("Email confirmé")}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {t(
              "Votre adresse a été vérifiée. Vous pouvez maintenant vous connecter.",
            )}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-md bg-[#3F561F] px-4 py-2 text-sm font-medium text-white"
          >
            {t("Se connecter")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <StandaloneLanguageBar />
      <div className="mx-auto max-w-md py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-red-700">
          {t("Vérification impossible")}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{t(result.error)}</p>
        <Link href="/login" className="underline">
          {t("Retour à la connexion")}
        </Link>
      </div>
    </>
  );
}
