import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session || session.type !== "retail") {
    redirect("/login?next=/checkout");
  }

  const customer = await prisma.retailCustomer.findUnique({
    where: { id: session.customerId },
    select: { name: true, phone: true, city: true, address: true },
  });

  if (!customer) {
    redirect("/login?next=/checkout");
  }

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">Accueil</Link>{" "}
        <span className="mx-1">›</span>
        <Link href="/cart" className="hover:underline">Mon panier</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>Validation</span>
      </nav>
      <h1
        className="mt-2 text-[28px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        Valider ma commande
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        Vérifiez vos informations de livraison et confirmez votre commande.
      </p>

      <div className="mt-6">
        <CheckoutForm
          defaultDelivery={{
            name: customer.name,
            phone: customer.phone,
            city: customer.city,
            address: customer.address,
          }}
        />
      </div>
    </main>
  );
}
