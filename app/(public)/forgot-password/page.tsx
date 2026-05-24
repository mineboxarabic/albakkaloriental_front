import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

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
        <h1 className="text-2xl font-semibold mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-muted-foreground mb-6">
          La réinitialisation en libre-service est en cours de déploiement.
          {isPro
            ? " En attendant, contactez votre interlocuteur commercial pour récupérer l'accès à votre portail professionnel."
            : " En attendant, contactez le support pour réinitialiser votre mot de passe."}
        </p>

        <div className="flex flex-col gap-3">
          {isPro ? (
            <a
              href="https://wa.me/33970707070"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Contacter par WhatsApp
            </a>
          ) : (
            <a
              href="mailto:support@bakkaloriental.fr"
              className="flex items-center justify-center gap-2 rounded-lg border bg-[#3F561F] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Écrire au support
            </a>
          )}

          <Link
            href={isPro ? "/pro/login" : "/login"}
            className="text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
