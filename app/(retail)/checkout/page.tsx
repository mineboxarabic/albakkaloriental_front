import { redirect } from "next/navigation";
import Link from "next/link";
import { getRetailMe } from "@/actions/retail-me";
import { getRetailCheckoutInstructions } from "@/actions/retail-order";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { CheckoutForm } from "./checkout-form";
import { CatalogAvailabilityNotice } from "@/components/catalog-availability-notice";
import { getTranslator } from "@/lib/server-language";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [result, instructionsMarkdown] = await Promise.all([
    getRetailMe(),
    getRetailCheckoutInstructions(),
  ]);
  if (!result.ok) {
    redirect("/login?next=/checkout");
  }
  const customer = result.customer;
  const { t } = await getTranslator();

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">{t("Accueil")}</Link>{" "}
        <span className="mx-1">›</span>
        <Link href="/cart" className="hover:underline">{t("Mon panier")}</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{t("Validation")}</span>
      </nav>
      <h1
        className="mt-2 text-[28px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        {t("Valider ma commande")}
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        {t("Vérifiez vos informations de livraison et confirmez votre commande.")}
      </p>

      <CatalogAvailabilityNotice audience="retail" />
      <div className="mt-6">
        <CheckoutForm
          instructionsMarkdown={instructionsMarkdown}
          defaultDelivery={{
            name: customer.name,
            phone: customer.phone,
            city: customer.city,
            postalCode: customer.postalCode ?? "",
            address: customer.address,
          }}
        />
      </div>
    </main>
  );
}
