import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, MapPin, LogOut, Package } from "lucide-react";
import { getRetailMe, getRetailOrders } from "@/actions/retail-me";
import { logoutRetail } from "@/actions/retail-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function AccountPage() {
  const [meResult, ordersResult] = await Promise.all([
    getRetailMe(),
    getRetailOrders(),
  ]);
  if (!meResult.ok) {
    redirect("/login?next=/account");
  }
  const customer = {
    ...meResult.customer,
    email: meResult.user.email,
    createdAt: new Date(),
  };
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
        <section className="col-span-8 flex flex-col gap-4">
          <Card title="INFORMATIONS PERSONNELLES">
            <Row icon={<User className="h-4 w-4" />} label="Nom complet" value={customer.name} />
            <Row icon={<Mail className="h-4 w-4" />} label="Adresse e-mail" value={customer.email ?? "—"} />
            <Row icon={<Phone className="h-4 w-4" />} label="Téléphone" value={customer.phone} />
          </Card>

          <Card title="ADRESSE DE LIVRAISON">
            <Row icon={<MapPin className="h-4 w-4" />} label="Ville" value={customer.city} />
            <Row label="Adresse complète" value={customer.address} />
          </Card>

          <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
            Pour modifier vos informations, contactez notre service client au
            09 70 70 70 70. La modification en ligne arrive bientôt.
          </p>
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border bg-white p-6"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="text-[11px] font-bold tracking-[0.14em]"
        style={{ color: COLORS.muted }}
      >
        {title}
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3">{children}</dl>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md"
        style={{
          background: icon ? COLORS.beige : "transparent",
          color: COLORS.primary,
        }}
      >
        {icon}
      </div>
      <div className="leading-tight">
        <dt className="text-[11px]" style={{ color: COLORS.muted }}>
          {label}
        </dt>
        <dd
          className="mt-0.5 text-[14px] font-semibold"
          style={{ color: COLORS.text }}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}
