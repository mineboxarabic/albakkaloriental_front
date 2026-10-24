import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";

/**
 * Minimal top bar for pages reached from e-mail links (verification, password
 * reset…) that render outside the shop layout: logo home link + FR/AR toggle.
 */
export function StandaloneLanguageBar() {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6 text-[#3F561F]">
      <Link href="/" aria-label="Le Bakkal Oriental">
        <Image
          src="/Assets/img/logo.png"
          alt="Le Bakkal Oriental"
          width={120}
          height={40}
          className="h-9 w-auto object-contain"
        />
      </Link>
      <LanguageSwitcher />
    </div>
  );
}
