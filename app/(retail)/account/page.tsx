import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, LogOut, Package } from "lucide-react";
import { getRetailMe, getRetailOrders } from "@/actions/retail-me";
import { logoutRetail } from "@/actions/retail-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { AccountEditForm } from "./account-edit-form";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export default async function AccountPage() {
  const [meResult, ordersResult] = await Promise.all([
    getRetailMe(),
    getRetailOrders(),
  ]);
  if (!meResult.ok) {
    redirect("/login?next=/account");
  }
  const customer = meResult.customer;
  const email = meResult.user.email;
  const { firstName, lastName } = splitName(customer.name);
  const orderCount = ordersResult.ok ? ordersResult.orders.length : 0;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">Accueil</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>Mon compte</span>
      </nav>

      <header className="mt-4 flex items-center gap-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ background: COLORS.beige, color: COLORS.primary }}
        >
          <User className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <div>
          <h1
            className="text-[28px] font-extrabold leading-tight tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Bonjour, {customer.name} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            Membre depuis le {DATE_FMT.format(new Date(customer.createdAt))}
          </p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-12 gap-6">
        <section className="col-span-8">
          <AccountEditForm
            defaults={{
              firstName,
              lastName,
              phone: customer.phone,
              city: customer.city,
              postalCode: customer.postalCode ?? "",
              address: customer.address,
            }}
          />

          <div className="mt-4">
            <ChangePasswordForm />
          </div>

          <div
            className="mt-4 rounded-xl border bg-white p-6"
            style={{ borderColor: COLORS.border }}
          >
            <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.muted }}>
              ADRESSE E-MAIL
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md"
                style={{ background: COLORS.beige, color: COLORS.primary }}
              >
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 leading-tight">
                <div className="text-[14px] font-semibold" style={{ color: COLORS.text }}>
                  {email}
                </div>
                <div className="text-[11.5px]" style={{ color: COLORS.muted }}>
                  Pour modifier votre adresse e-mail, contactez le support
                  (re-vérification requise — bientôt disponible).
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-4 flex flex-col gap-4">
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid h-10 w-10 place-items-center rounded-md"
                style={{ background: COLORS.beige, color: COLORS.primary }}
              >
                <Package className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-[11.5px]" style={{ color: COLORS.muted }}>
                  Commandes passées
                </div>
                <div className="text-[22px] font-extrabold" style={{ color: COLORS.text }}>
                  {orderCount}
                </div>
              </div>
            </div>
          </div>

          <form action={logoutRetail}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-[13px] font-semibold"
              style={{ borderColor: COLORS.border, color: COLORS.red, background: "#FFFFFF" }}
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Se déconnecter
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
