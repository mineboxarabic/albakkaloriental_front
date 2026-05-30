import Link from "next/link";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-2xl font-semibold">Nous contacter</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Une question, une commande, une suggestion ? Choisissez le canal qui
          vous convient le mieux.
        </p>

        <div className="space-y-3">
          <a
            href="mailto:support@bakkaloriental.fr"
            className="flex items-start gap-3 rounded-md border bg-[#FAF8F2] px-4 py-3 transition hover:bg-[#F0EBDD]"
          >
            <Mail className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold">Email</div>
              <div className="text-muted-foreground">support@bakkaloriental.fr</div>
            </div>
          </a>

          <a
            href="https://wa.me/33970707070"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-md border bg-[#E5F0D9] px-4 py-3 transition hover:bg-[#D9E5C0]"
          >
            <MessageCircle className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold">WhatsApp (commercial pro)</div>
              <div className="text-muted-foreground">+33 9 70 70 70 70</div>
            </div>
          </a>

          <div className="flex items-start gap-3 rounded-md border px-4 py-3">
            <MapPin className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold">Adresse</div>
              <div className="text-muted-foreground">
                Le Bakkal Oriental — 83300 Draguignan, France
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm font-semibold underline-offset-2 hover:underline"
            style={{ color: "#3F561F" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
