import Link from "next/link";
import SetPasswordForm from "./set-password-form";
import { getTranslator } from "@/lib/server-language";
import { StandaloneLanguageBar } from "@/components/standalone-language-bar";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage({
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
            {t("Aucun jeton d'activation n'a été fourni.")}
          </p>
          <Link href="/pro/login" className="underline">
            {t("Retour à la connexion")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <StandaloneLanguageBar />
      <div className="mx-auto max-w-md py-16 px-4">
        <h1 className="text-2xl font-semibold mb-2">
          {t("Définir mon mot de passe")}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t(
            "Bienvenue. Choisissez un mot de passe pour activer votre compte professionnel.",
          )}
        </p>
        <SetPasswordForm token={token} />
      </div>
    </>
  );
}
