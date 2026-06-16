import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Store,
  Tag,
  Headphones,
  ChevronRight,
  WifiOff,
} from "lucide-react";
import { getCategories, getFeaturedCategories, getProducts, getUpcomingDeliveries } from "@/lib/catalog";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { getCategoryDisplay, getDisplayCategories } from "@/lib/category-display";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { DeliveryChecker } from "@/components/retail/delivery-checker";

// Match the "Planning de livraison hebdomadaire" typography (Inter + JetBrains Mono).
const INTER = "var(--font-inter), 'Inter', system-ui, sans-serif";
const MONO = "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace";

export const revalidate = 60;

const FALLBACK_CATEGORIES = [
  "CONFISERIES",
  "BOISSONS",
  "ÉPICES",
  "PRODUITS FRAIS",
  "HUILES",
  "CONSERVES",
  "RIZ ET PÂTES",
];


export default async function Home() {
  const [{ products: retailProducts, backendDown }, deliveries, categories, featuredCategories] = await Promise.all([
    getProducts({ audience: "retail", take: 12 }),
    getUpcomingDeliveries(4),
    getCategories("retail"),
    getFeaturedCategories(),
  ]);

  const bestSellers = retailProducts.slice(0, 6);
  const newArrivals = retailProducts.slice(6, 12);

  const productCategories = Array.from(
    new Set(
      retailProducts.flatMap((p) =>
        p.category ? p.category.toUpperCase().split(",").map((c) => c.trim()) : []
      )
    )
  );
  // Admin-curated featured categories take priority on the homepage, using their
  // real logo/image. When none are featured, fall back to the previous behavior.
  const categoryDisplays =
    featuredCategories.length > 0
      ? featuredCategories
          .map((c) => ({ name: c.name, image: c.imageUrl || getCategoryDisplay(c.name).image }))
          .slice(0, 6)
      : getDisplayCategories(
          categories.length > 0
            ? categories
            : productCategories.length > 0
              ? productCategories
              : FALLBACK_CATEGORIES,
        ).slice(0, 6);

  const serverDate = new Date().toISOString();

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16">
      {backendDown && (
        <div
          className="mt-4 flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[13px]"
          style={{ borderColor: "#F2C400", background: "#FFFBEA", color: "#92740A" }}
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          Le serveur est temporairement indisponible — le catalogue ne peut pas être chargé.
        </div>
      )}

      <DeliveryChecker deliveries={deliveries} serverDate={serverDate} />

      <section
        className="relative mt-5 overflow-hidden rounded-lg border shadow-[0_18px_44px_-26px_rgba(23,23,23,0.28)]"
        style={{ background: "#FFFFFF", borderColor: COLORS.border, fontFamily: INTER }}
      >
        <div className="grid grid-cols-1 items-end gap-4 px-6 pt-6 pb-0 lg:grid-cols-12 lg:px-8 lg:pt-8">
          <div className="flex flex-col justify-center pb-6 lg:col-span-5 lg:pb-10">
            <div
              className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.18em", color: COLORS.muted }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.primary }} />
              Épicerie orientale
            </div>
            <h1
              className="text-[26px] font-medium leading-[1.04] tracking-tight sm:text-[30px]"
              style={{ color: COLORS.text }}
            >
              Vos produits orientaux préférés,{" "}
              <span style={{ color: COLORS.primary }}>livrés chez vous</span>
            </h1>
            <p
              className="mt-2 max-w-[320px] text-[13px] leading-relaxed"
              style={{ color: COLORS.muted }}
            >
              Faites vos courses en ligne et recevez-les directement à domicile
              lors de nos tournées.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase transition-opacity hover:opacity-90"
              style={{ fontFamily: MONO, letterSpacing: "0.08em", background: COLORS.primary, color: "#FAF8F2" }}
            >
              Voir nos produits
            </Link>
          </div>
          <div className="relative -mx-6 flex items-end justify-center lg:col-span-7 lg:mx-0">
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
              className="absolute right-3 top-2 h-[68px] w-[68px] rotate-[8deg] drop-shadow-md sm:right-2 sm:h-[150px] sm:w-[150px]"
            />
          </div>
        </div>
      </section>

      <section
        className="mt-5 grid grid-cols-2 gap-4 rounded-xl border bg-white px-5 py-5 lg:flex lg:flex-wrap lg:items-center lg:justify-around lg:gap-6 lg:px-8"
        style={{ borderColor: COLORS.border }}
      >
        <Feature icon={<Truck className="h-6 w-6" strokeWidth={1.8} />} title="LIVRAISON RAPIDE" sub="Partout en France" />
        <Feature icon={<Store className="h-6 w-6" strokeWidth={1.8} />} title="CLICK & COLLECT" sub="Retrait en magasin" />
        <Feature icon={<Tag className="h-6 w-6" strokeWidth={1.8} />} title="PRIX ACCESSIBLES" sub="Toute l'année" />
        <Feature icon={<Headphones className="h-6 w-6" strokeWidth={1.8} />} title="SERVICE CLIENT" sub="À votre écoute" />
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2
            className="text-[22px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Nos catégories
          </h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-[12px] font-semibold"
            style={{ color: COLORS.primary }}
          >
            Voir toutes les catégories <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {categoryDisplays.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
              style={{ borderColor: COLORS.border }}
            >
              <div className="relative h-[90px] w-full overflow-hidden sm:h-[110px]" style={{ background: COLORS.beige }}>
                <Image
                  src={category.image}
                  alt=""
                  width={320}
                  height={220}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="w-full px-2 py-2.5 text-center">
                <div
                  className="text-[10px] font-bold tracking-wide"
                  style={{ color: COLORS.text }}
                >
                  {category.name.toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="mt-8 grid grid-cols-1 items-center gap-6 overflow-hidden rounded-2xl px-6 py-8 lg:grid-cols-12 lg:px-10 lg:py-10"
        style={{ background: COLORS.beige }}
      >
        <div className="hidden items-center justify-center lg:col-span-3 lg:flex">
          <Image
            src="/Assets/img/stick1.png"
            alt="Les bons plans"
            width={320}
            height={220}
            className="h-auto w-full max-w-[240px] object-contain"
          />
        </div>
        <div className="text-center lg:col-span-3 lg:text-left">
          <h3
            className="text-[26px] font-extrabold leading-[1.1] tracking-tight sm:text-[34px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Épicerie orientale livrée chez vous
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed sm:text-[15px]" style={{ color: COLORS.muted }}>
            Découvrez nos rayons et commandez en quelques clics.
          </p>
        </div>
        <div className="flex justify-center lg:col-span-3">
          <Link
            href="/products"
            className="inline-flex items-center rounded-md px-7 py-3.5 text-[14px] font-semibold text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            Voir le catalogue
          </Link>
        </div>
        <div className="hidden items-center justify-end lg:col-span-3 lg:flex">
          <Image
            src="/Assets/img/products.png"
            alt="Panier de courses"
            width={480}
            height={380}
            className="h-auto w-full max-w-[360px] object-contain"
          />
        </div>
      </section>

      <ProductSection
        title="Les meilleures ventes"
        linkLabel="Voir tous les produits"
        items={bestSellers}
        emptyLabel="Aucun produit disponible pour le moment."
      />
      <ProductSection
        title="Nouveautés"
        linkLabel="Voir toutes les nouveautés"
        items={newArrivals}
        emptyLabel="Les nouveautés arriveront bientôt."
      />

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
        style={{ background: COLORS.bg, color: COLORS.primary }}
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
  emptyLabel,
}: {
  title: string;
  linkLabel: string;
  items: ProductCardData[];
  emptyLabel: string;
}) {
  return (
    <section className="mt-9">
      <div className="flex items-end justify-between">
        <h2
          className="text-[22px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: COLORS.primary }}
        >
          {linkLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {items.length === 0 ? (
        <div
          className="mt-4 rounded-lg border bg-white px-4 py-6 text-center text-[13px]"
          style={{ borderColor: COLORS.border, color: COLORS.muted }}
        >
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
