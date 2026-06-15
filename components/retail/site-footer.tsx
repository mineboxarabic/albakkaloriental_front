import { Phone, Mail, MapPin } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { company } from "@/lib/company";

export function SiteFooter() {
  const socialLinks = [
    {
      label: "Facebook",
      href: company.socials.facebook,
      path: "M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.6-1.5H16.5V4.4C16.2 4.4 15.2 4.3 14.1 4.3c-2.3 0-3.9 1.4-3.9 4v2.2H7.5v3h2.7V21h3.3z",
    },
    {
      label: "Instagram",
      href: company.socials.instagram,
      path: null,
      isInstagram: true,
    },
    {
      label: "X",
      href: company.socials.x,
      path: "M17.5 4h2.6l-5.7 6.5L21 20h-5.3l-4.1-5.4L6.7 20H4l6.1-7L3.5 4h5.4l3.7 4.9L17.5 4zm-.9 14.4h1.4L7.5 5.5H6L16.6 18.4z",
    },
    {
      label: "YouTube",
      href: company.socials.youtube,
      path: "M21.6 8.3a2.5 2.5 0 0 0-1.8-1.8C18.2 6 12 6 12 6s-6.2 0-7.8.5A2.5 2.5 0 0 0 2.4 8.3 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.7 2.5 2.5 0 0 0 1.8 1.8c1.6.5 7.8.5 7.8.5s6.2 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .4-3.7 26 26 0 0 0-.4-3.7zM10 15V9l5.2 3L10 15z",
    },
  ].filter((s) => s.href);

  return (
    <footer className="mt-8" style={{ background: COLORS.primary, color: "#FAF8F2" }}>
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-6 gap-y-9 px-6 py-10 md:grid-cols-12 md:gap-8 md:py-12">
        <div className="col-span-2 md:col-span-4">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden>
              <path
                d="M17 4c-3 6-7 9-12 10 1 8 6 14 12 16 6-2 11-8 12-16-5-1-9-4-12-10z"
                fill="#FAF8F2"
              />
              <path
                d="M17 10c-1 3-4 5-7 6 1 4 4 8 7 9 3-1 6-5 7-9-3-1-6-3-7-6z"
                fill={COLORS.primary}
              />
            </svg>
            <div className="leading-tight">
              <div
                className="text-[18px] font-extrabold tracking-tight"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                LE BAKKAL
              </div>
              <div className="text-[9px] tracking-[0.35em] opacity-80">ORIENTAL</div>
            </div>
          </div>
          <p className="mt-4 max-w-[280px] text-[12.5px] leading-relaxed opacity-85">
            Votre épicerie orientale de confiance. Des produits authentiques,
            soigneusement sélectionnés, livrés partout en France.
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((s) => (
                <SocialLink key={s.label} label={s.label} href={s.href!}>
                  {s.isInstagram ? (
                    <>
                      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="17" cy="7" r="1" fill="currentColor" />
                    </>
                  ) : (
                    <path d={s.path!} />
                  )}
                </SocialLink>
              ))}
            </div>
          )}
        </div>

        <FooterCol
          title="Catalogue"
          links={[
            "Épicerie salée",
            "Épicerie sucrée",
            "Boissons",
            "Produits frais",
            "Surgelés",
            "Hygiène & maison",
          ]}
        />
        <FooterCol
          title="Services"
          links={[
            "Livraison à domicile",
            "Click & collect",
            "Espace professionnels",
            "Promotions",
            "Cartes cadeaux",
          ]}
        />
        <FooterCol
          title="À propos"
          links={[
            "Qui sommes-nous",
            "Nos engagements",
            "Mentions légales",
            "CGV",
            "Politique de confidentialité",
          ]}
        />

        <div className="col-span-1 md:col-span-2">
          <div className="text-[12px] font-bold tracking-wide opacity-90">CONTACT</div>
          <ul className="mt-4 space-y-3 text-[12.5px] opacity-90">
            {company.phone && (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {company.phone}
              </li>
            )}
            {company.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {company.email}
              </li>
            )}
            {company.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {company.address}
                  <br />
                  {company.city}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 px-6 py-4 text-[11.5px] opacity-80 md:flex-row">
          <span>
            © {new Date().getFullYear()} {company.name}. Tous droits réservés.
          </span>
          <span className="flex items-center gap-4">
            <a href="/cgv" className="hover:underline">CGV</a>
            <a href="/confidentialite" className="hover:underline">Confidentialité</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/30 hover:bg-white/10"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="col-span-1 md:col-span-2">
      <div className="text-[12px] font-bold tracking-wide opacity-90">
        {title.toUpperCase()}
      </div>
      <ul className="mt-4 space-y-2.5 text-[12.5px] opacity-85">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:underline">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
