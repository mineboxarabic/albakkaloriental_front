import Link from "next/link";
import { MailCheck } from "lucide-react";
import { getTranslator } from "@/lib/server-language";
import { StandaloneLanguageBar } from "@/components/standalone-language-bar";

export const dynamic = "force-dynamic";

export default async function VerifyPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const { t } = await getTranslator();

  return (
    <>
    <StandaloneLanguageBar />
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-[#E8F1D8] p-3">
            <MailCheck className="h-8 w-8 text-[#3F561F]" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-semibold">
          {t("Vérifiez votre boîte mail")}
        </h1>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {email ? (
            <>
              {t("Un lien de confirmation vient d'être envoyé à")}{" "}
              <strong className="ltr-isolate font-semibold text-foreground">
                {email}
              </strong>
              {t(". Cliquez dessus pour activer votre compte.")}
            </>
          ) : (
            <>
              {t(
                "Un lien de confirmation vient d'être envoyé à votre adresse e-mail. Cliquez dessus pour activer votre compte.",
              )}
            </>
          )}
        </p>

        <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-900">
          {t(
            "Si vous ne le trouvez pas, pensez à vérifier vos courriers indésirables (spam).",
          )}
        </div>

        <Link
          href="/login"
          className="block text-center text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: "#3F561F" }}
        >
          {t("Retour à la connexion")}
        </Link>
      </div>
    </div>
    </>
  );
}
