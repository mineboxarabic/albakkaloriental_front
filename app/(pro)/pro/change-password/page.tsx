import { KeyRound } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { getTranslator } from "@/lib/server-language";
import { ForcedPasswordChange } from "./forced-password-change";

/**
 * A pro account created by staff starts with a temporary password. The
 * middleware sends that session here until the client picks their own.
 */
export default async function ProChangePasswordPage() {
  const { t } = await getTranslator();
  return (
    <main className="mx-auto max-w-[560px] px-6 py-12 pb-16">
      <h1
        className="flex items-center gap-2 text-[26px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        <KeyRound className="h-6 w-6" style={{ color: COLORS.primary }} />
        {t("Choisissez votre mot de passe")}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: COLORS.muted }}>
        {t(
          "Votre compte a été créé avec un mot de passe temporaire. Pour protéger votre compte, choisissez votre propre mot de passe avant de continuer.",
        )}
      </p>
      <div className="mt-6 rounded-sm p-5" style={{ background: COLORS.text }}>
        <ForcedPasswordChange />
      </div>
    </main>
  );
}
