import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  Truck,
  Store,
  Tag,
  Headphones,
  Plus,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const DISPLAY_FONT = "'Satoshi', var(--font-poppins), sans-serif";

const COLORS = {
  primary: "#3F561F",
  bg: "#FAF8F2",
  beige: "#F0EBDD",
  text: "#171717",
  muted: "#6B665D",
  border: "#DDD8CC",
  red: "#D52B14",
  yellow: "#F2C400",
};

const categories = [
  { label: "ÉPICERIE SALÉE" },
  { label: "BOISSONS" },
  { label: "ÉPICERIE SUCRÉE" },
  { label: "PRODUITS FRAIS" },
  { label: "SURGELÉS" },
  { label: "HYGIÈNE & MAISON" },
];

const bestSellers = [
  { name: "Couscous SALÉ", weight: "1kg", price: "2,35 €" },
  { name: "Huile d'olive Al Arz", weight: "1L", price: "8,95 €" },
  { name: "Concombre Suntat", weight: "680g", price: "2,10 €" },
  { name: "Riz Basmati Punjabi", weight: "5kg", price: "11,90 €" },
  { name: "Pois chiches Chtoura", weight: "400g", price: "1,05 €" },
  { name: "Dattes Deglet Nour", weight: "1kg", price: "4,95 €" },
];

const newArrivals = [
  { name: "Harissa du Cap Bon", weight: "200g", price: "1,75 €" },
  { name: "Thé vert à la menthe", weight: "500g", price: "6,40 €" },
  { name: "Olives vertes Picholine", weight: "300g", price: "3,20 €" },
  { name: "Semoule fine extra", weight: "1kg", price: "1,90 €" },
  { name: "Confiture de figues", weight: "370g", price: "4,50 €" },
  { name: "Eau de fleur d'oranger", weight: "250ml", price: "3,80 €" },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full" style={{ background: COLORS.bg }}>
      {/* Top utility bar */}
      <div
        className="w-full text-[12px]"
        style={{ background: COLORS.primary, color: "#FAF8F2" }}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Livraison à domicile dans toute la France</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Besoin d&apos;aide ? 09 70 70 70 70</span>
            <a className="flex items-center gap-1.5 hover:underline" href="#">
              <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
              Mon compte
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="w-full" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-6 py-5">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
              <path
                d="M17 4c-3 6-7 9-12 10 1 8 6 14 12 16 6-2 11-8 12-16-5-1-9-4-12-10z"
                fill={COLORS.primary}
              />
              <path
                d="M17 10c-1 3-4 5-7 6 1 4 4 8 7 9 3-1 6-5 7-9-3-1-6-3-7-6z"
                fill="#FAF8F2"
              />
            </svg>
            <div className="leading-tight">
              <div
                className="text-[20px] font-extrabold tracking-tight"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                LE BAKKAL
              </div>
              <div
                className="text-[10px] tracking-[0.35em] font-medium"
                style={{ color: COLORS.muted }}
              >
                ORIENTAL
              </div>
            </div>
          </Link>

          <div className="mx-4 flex-1">
            <div
              className="flex h-11 items-stretch overflow-hidden rounded-md border"
              style={{ borderColor: COLORS.border, background: "#FFFFFF" }}
            >
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-transparent px-4 text-[13px] outline-none placeholder:text-[#9A968C]"
                style={{ color: COLORS.text }}
              />
              <button
                className="grid w-12 place-items-center text-white"
                style={{ background: COLORS.primary }}
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <button
            className="grid h-11 w-11 shrink-0 place-items-center"
            style={{ color: COLORS.text }}
            aria-label="Favoris"
          >
            <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </button>

          <button
            className="flex h-11 shrink-0 items-center gap-2.5"
            style={{ color: COLORS.text }}
            aria-label="Panier"
          >
            <span className="relative grid place-items-center">
              <ShoppingCart
                className="h-[24px] w-[24px]"
                strokeWidth={1.8}
                style={{ color: COLORS.primary }}
              />
              <span
                className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
                style={{ background: COLORS.red }}
              >
                2
              </span>
            </span>
            <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>
              12,60 €
            </span>
          </button>
        </div>

        {/* Primary navigation */}
        <nav
          className="border-t"
          style={{ borderColor: COLORS.border, background: "#FFFFFF" }}
        >
          <div className="mx-auto flex max-w-[1180px] items-center gap-7 px-6 py-3 text-[12px] font-semibold tracking-wide">
            <a
              href="#"
              className="flex items-center gap-2"
              style={{ color: COLORS.red }}
            >
              <Menu className="h-4 w-4" strokeWidth={2.4} />
              TOUS LES RAYONS
            </a>
            {["ÉPICERIE", "BOISSONS", "PRODUITS FRAIS", "SURGELÉS", "HYGIÈNE & MAISON"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:opacity-70"
                  style={{ color: COLORS.text }}
                >
                  {item}
                </a>
              )
            )}
            <a href="#" style={{ color: COLORS.red }}>
              PROMOTIONS
            </a>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 pb-16">
        {/* Hero */}
        <section
          className="relative mt-5 overflow-hidden rounded-xl"
          style={{ background: COLORS.beige }}
        >
          <div className="grid grid-cols-12 items-end gap-4 px-10 pt-12 pb-0">
            <div className="col-span-5 flex flex-col justify-center pb-12">
              <h1
                className="text-[34px] font-extrabold leading-[1.1] tracking-tight"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                Vos produits
                <br />
                orientaux préférés,
                <br />
                <span style={{ color: COLORS.primary }}>au meilleur prix</span>
              </h1>
              <p
                className="mt-4 max-w-[300px] text-[13.5px] leading-relaxed"
                style={{ color: COLORS.muted }}
              >
                Épicerie, produits frais, boissons
                <br />
                et bien plus encore.
              </p>
              <a
                href="/products"
                className="mt-6 inline-flex w-fit items-center rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm"
                style={{ background: COLORS.primary }}
              >
                Voir nos produits
              </a>
            </div>
            <div className="col-span-7 relative flex items-end justify-center">
              <Image
                src="/Assets/img/banner.png"
                alt="Produits orientaux"
                width={780}
                height={520}
                className="relative z-0 block h-auto w-full max-w-[620px] object-contain"
                priority
              />
              <Image
                src="/Assets/img/stick.png"
                alt="Prix justes tous les jours"
                width={180}
                height={180}
                className="absolute right-2 top-2 h-[150px] w-[150px] rotate-[8deg] drop-shadow-md"
              />
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section
          className="mt-5 flex flex-wrap items-center justify-around gap-6 rounded-xl border bg-white px-8 py-5"
          style={{ borderColor: COLORS.border }}
        >
          <Feature icon={<Truck className="h-6 w-6" strokeWidth={1.8} />} title="LIVRAISON RAPIDE" sub="Partout en France" />
          <Feature icon={<Store className="h-6 w-6" strokeWidth={1.8} />} title="CLICK & COLLECT" sub="Retrait en magasin" />
          <Feature icon={<Tag className="h-6 w-6" strokeWidth={1.8} />} title="PRIX ACCESSIBLES" sub="Toute l'année" />
          <Feature icon={<Headphones className="h-6 w-6" strokeWidth={1.8} />} title="SERVICE CLIENT" sub="À votre écoute" />
        </section>

        {/* Nos catégories */}
        <section className="mt-9">
          <div className="flex items-end justify-between">
            <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}>
              Nos catégories
            </h2>

            <a
              href="#"
              className="flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: COLORS.primary }}
            >
              Voir toutes les catégories <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-3">
            {categories.map((c) => (
              <a
                key={c.label}
                href="#"
                className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
                style={{ borderColor: COLORS.border }}
              >
                <div className="h-[110px] w-full" style={{ background: COLORS.beige }} />
                <div className="w-full px-2 py-2.5 text-center">
                  <div
                    className="text-[10px] font-bold tracking-wide"
                    style={{ color: COLORS.text }}
                  >
                    {c.label}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Bons plans banner */}
        <section
          className="mt-8 grid grid-cols-12 items-center gap-6 overflow-hidden rounded-2xl px-10 py-10"
          style={{ background: COLORS.beige }}
        >
          <div className="col-span-3 flex items-center justify-center">
            <Image
              src="/Assets/img/stick1.png"
              alt="Les bons plans"
              width={320}
              height={220}
              className="h-auto w-full max-w-[240px] object-contain"
            />
          </div>
          <div className="col-span-3">
            <h3
              className="text-[34px] font-extrabold leading-[1.1] tracking-tight"
              style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
            >
              Des promotions
              <br />
              chaque semaine !
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: COLORS.muted }}>
              Découvrez nos offres
              <br />
              sur une sélection de produits.
            </p>
          </div>
          <div className="col-span-3 flex justify-center">
            <a
              href="#"
              className="inline-flex items-center rounded-md px-7 py-4 text-[14px] font-semibold text-white shadow-sm"
              style={{ background: COLORS.primary }}
            >
              Voir les promotions
            </a>
          </div>
          <div className="col-span-3 flex items-center justify-end">
            <Image
              src="/Assets/img/products.png"
              alt="Panier de courses"
              width={480}
              height={380}
              className="h-auto w-full max-w-[360px] object-contain"
            />
          </div>
        </section>

        <ProductSection title="Les meilleures ventes" linkLabel="Voir tous les produits" items={bestSellers} />
        <ProductSection title="Nouveautés" linkLabel="Voir toutes les nouveautés" items={newArrivals} />
      </div>

      <Footer />
    </main>
  );
}

function Feature({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 place-items-center rounded-md"
        style={{ background: "#FAF8F2", color: COLORS.primary }}
      >
        {icon}
      </div>
      <div className="leading-tight">
        <div
          className="text-[11.5px] font-bold tracking-wide"
          style={{ color: COLORS.text }}
        >
          {title}
        </div>
        <div className="text-[11px]" style={{ color: COLORS.muted }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function ProductSection({
  title,
  linkLabel,
  items,
}: {
  title: string;
  linkLabel: string;
  items: { name: string; weight: string; price: string }[];
}) {
  return (
    <section className="mt-9">
      <div className="flex items-end justify-between">
        <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}>
          {title}
        </h2>
        <a
          href="#"
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: COLORS.primary }}
        >
          {linkLabel} <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-3">
        {items.map((p) => (
          <article
            key={p.name}
            className="flex flex-col overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <div className="h-[140px] w-full" style={{ background: COLORS.beige }} />
            <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-3">
              <div
                className="line-clamp-2 min-h-[34px] text-[12.5px] font-semibold leading-tight"
                style={{ color: COLORS.text }}
              >
                {p.name}
              </div>
              <div className="text-[11px]" style={{ color: COLORS.muted }}>
                {p.weight}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className="text-[14px] font-extrabold"
                  style={{ color: COLORS.text }}
                >
                  {p.price}
                </span>
                <button
                  aria-label="Ajouter au panier"
                  className="grid h-7 w-7 place-items-center rounded-full text-white shadow-sm"
                  style={{ background: COLORS.primary }}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-8" style={{ background: COLORS.primary, color: "#FAF8F2" }}>
      <div className="mx-auto grid max-w-[1180px] grid-cols-12 gap-8 px-6 py-12">
        <div className="col-span-4">
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
              <div className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>LE BAKKAL</div>
              <div className="text-[9px] tracking-[0.35em] opacity-80">ORIENTAL</div>
            </div>
          </div>
          <p className="mt-4 max-w-[280px] text-[12.5px] leading-relaxed opacity-85">
            Votre épicerie orientale de confiance. Des produits authentiques,
            soigneusement sélectionnés, livrés partout en France.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <SocialLink label="Facebook">
              <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.6-1.5H16.5V4.4C16.2 4.4 15.2 4.3 14.1 4.3c-2.3 0-3.9 1.4-3.9 4v2.2H7.5v3h2.7V21h3.3z" />
            </SocialLink>
            <SocialLink label="Instagram">
              <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17" cy="7" r="1" fill="currentColor" />
            </SocialLink>
            <SocialLink label="X">
              <path d="M17.5 4h2.6l-5.7 6.5L21 20h-5.3l-4.1-5.4L6.7 20H4l6.1-7L3.5 4h5.4l3.7 4.9L17.5 4zm-.9 14.4h1.4L7.5 5.5H6L16.6 18.4z" />
            </SocialLink>
            <SocialLink label="YouTube">
              <path d="M21.6 8.3a2.5 2.5 0 0 0-1.8-1.8C18.2 6 12 6 12 6s-6.2 0-7.8.5A2.5 2.5 0 0 0 2.4 8.3 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.7 2.5 2.5 0 0 0 1.8 1.8c1.6.5 7.8.5 7.8.5s6.2 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .4-3.7 26 26 0 0 0-.4-3.7zM10 15V9l5.2 3L10 15z" />
            </SocialLink>
          </div>
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

        <div className="col-span-2">
          <div className="text-[12px] font-bold tracking-wide opacity-90">CONTACT</div>
          <ul className="mt-4 space-y-3 text-[12.5px] opacity-90">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              09 70 70 70 70
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              contact@alimexpress.fr
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                13 Rue des Endronnes
                <br />
                83300 Draguignan
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 px-6 py-4 text-[11.5px] opacity-80 md:flex-row">
          <span>
            © {new Date().getFullYear()} AlimExpress / Le Bakkal Oriental. Tous droits réservés.
          </span>
          <span className="flex items-center gap-4">
            <a href="#" className="hover:underline">Mentions légales</a>
            <a href="#" className="hover:underline">CGV</a>
            <a href="#" className="hover:underline">Cookies</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/30 hover:bg-white/10"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        {children}
      </svg>
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="col-span-2">
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
