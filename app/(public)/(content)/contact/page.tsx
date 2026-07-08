import { Mail, MessageCircle, MapPin, Phone } from "lucide-react";
import { InfoPage } from "@/components/info-page";
import { company } from "@/lib/company";
import { COLORS } from "@/lib/ui";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact">
      <p className="mb-6 text-sm" style={{ color: COLORS.muted }}>
        Une question, une commande, une suggestion ? Choisissez le canal qui
        vous convient le mieux.
      </p>

      <div className="space-y-3">
        <a
          href={`mailto:${company.email}`}
          className="flex items-start gap-3 rounded-md border bg-[#FAF8F2] px-4 py-3 transition hover:bg-[#F0EBDD]"
        >
          <Mail className="mt-0.5 h-5 w-5 text-[#3F561F]" />
          <div className="flex-1 text-sm">
            <div className="font-semibold" style={{ color: COLORS.text }}>Email</div>
            <div style={{ color: COLORS.muted }}>{company.email}</div>
          </div>
        </a>

        {company.phone && (
          <a
            href={`tel:${company.phone}`}
            className="flex items-start gap-3 rounded-md border bg-[#FAF8F2] px-4 py-3 transition hover:bg-[#F0EBDD]"
          >
            <Phone className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold" style={{ color: COLORS.text }}>Téléphone</div>
              <div style={{ color: COLORS.muted }}>{company.phone}</div>
            </div>
          </a>
        )}

        {company.whatsappUrl && (
          <a
            href={company.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-md border bg-[#E5F0D9] px-4 py-3 transition hover:bg-[#D9E5C0]"
          >
            <MessageCircle className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold" style={{ color: COLORS.text }}>WhatsApp (commercial pro)</div>
              <div style={{ color: COLORS.muted }}>{company.phone}</div>
            </div>
          </a>
        )}

        {company.address && (
          <div className="flex items-start gap-3 rounded-md border px-4 py-3">
            <MapPin className="mt-0.5 h-5 w-5 text-[#3F561F]" />
            <div className="flex-1 text-sm">
              <div className="font-semibold" style={{ color: COLORS.text }}>Adresse</div>
              <div style={{ color: COLORS.muted }}>
                {company.name} — {company.address}, {company.city},{" "}
                {company.country}
              </div>
            </div>
          </div>
        )}
      </div>
    </InfoPage>
  );
}
