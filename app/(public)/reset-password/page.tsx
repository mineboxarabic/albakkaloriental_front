import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";
import { getTranslator } from "@/lib/server-language";
import { StandaloneLanguageBar } from "@/components/standalone-language-bar";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("Définir un nouveau mot de passe") };
}

export default async function ResetPasswordPage({
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
        <Link href="/forgot-password" className="underline">
          {t("Demander un nouveau lien")}
        </Link>
      </div>
      </>
    );
  }

  return (
    <>
    <StandaloneLanguageBar />
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">
          {t("Nouveau mot de passe")}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("Choisissez un nouveau mot de passe (8 caractères minimum).")}
        </p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
    </>
  );
}
