import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt, Construction, Mail } from "lucide-react";
import { getSession } from "@/lib/session";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

// TODO(invoices): brancher le modele `Invoice` quand l'admin AlimExpressApp
// genere les factures. Champs disponibles cote admin :
// invoiceNumber, invoiceDate, dueDate, status (UNPAID/PAID/OVERDUE/CANCELLED),
// totalAmount, paidAmount, pdfPath, sentAt, items.
// Lister par customerId via : prisma.invoice.findMany({ where: { customerId } })
// et exposer le PDF via pdfPath (S3) ou un endpoint signe.

export default async function ProInvoicesPage() {
  const session = await getSession();
  if (!session || session.type !== "pro") {
    redirect("/pro/login?next=/pro/invoices");
  }

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/pro/products" className="hover:underline">
            Catalogue pro
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>Mes factures</span>
        </nav>
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Mes factures
        </h1>
      </header>

      <section
        className="relative overflow-hidden rounded-sm border bg-white"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="absolute right-0 top-0 h-full w-2"
          style={{ background: COLORS.primary }}
          aria-hidden
        />
        <div className="grid grid-cols-12 items-center gap-8 px-10 py-14">
          <div className="col-span-7">
            <span
              className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10.5px] font-bold tracking-[0.14em]"
              style={{ background: "#FFF1D6", color: "#7A5409" }}
            >
              <Construction className="h-3 w-3" strokeWidth={2.4} />
              BIENTÔT DISPONIBLE
            </span>
            <h2
              className="mt-3 text-[24px] font-extrabold leading-tight"
              style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
            >
              Vos factures seront disponibles ici après livraison.
            </h2>
            <p className="mt-3 max-w-[460px] text-[13.5px] leading-relaxed" style={{ color: COLORS.muted }}>
              Dès qu&apos;une commande passe au statut <strong>Livrée</strong>, notre équipe
              émet la facture définitive depuis l&apos;outil interne. Elle apparaîtra
              automatiquement dans cet espace avec son numéro, son montant et son
              statut de paiement.
            </p>

            <ul className="mt-6 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
              <Bullet>Téléchargement du PDF de chaque facture</Bullet>
              <Bullet>Suivi des paiements (réglé · en attente · en retard)</Bullet>
              <Bullet>Récapitulatif fiscal annuel exportable</Bullet>
            </ul>

            <div
              className="mt-6 inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-[12px]"
              style={{
                borderColor: COLORS.border,
                background: COLORS.beige,
                color: COLORS.text,
              }}
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={2} style={{ color: COLORS.primary }} />
              En attendant, vous recevez vos factures par e-mail à{" "}
              <strong>{session.email}</strong>.
            </div>
          </div>

          <div className="col-span-5 flex justify-center">
            <div
              className="grid h-44 w-44 place-items-center rounded-full"
              style={{ background: COLORS.beige, color: COLORS.primary }}
            >
              <Receipt className="h-20 w-20" strokeWidth={1.4} />
            </div>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-[11.5px]" style={{ color: COLORS.muted }}>
        Pour toute question facturation, contactez votre interlocuteur commercial.
      </p>
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="mt-1.5 h-1.5 w-1.5 rounded-full"
        style={{ background: COLORS.primary }}
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}
