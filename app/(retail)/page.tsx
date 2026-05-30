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
import { getProducts, getUpcomingDeliveries } from "@/lib/catalog";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { DeliveryChecker } from "@/components/retail/delivery-checker";


export const revalidate = 60;

const FALLBACK_CATEGORIES = [
  "ÉPICERIE SALÉE",
  "BOISSONS",
  "ÉPICERIE SUCRÉE",
  "PRODUITS FRAIS",
  "SURGELÉS",
  "HYGIÈNE & MAISON",
];


export default async function Home() {
  const [{ products: retailProducts, backendDown }, deliveries] = await Promise.all([
    getProducts({ audience: "retail", take: 12 }),
    getUpcomingDeliveries(4),
  ]);

  const bestSellers = retailProducts.slice(0, 6);
  const newArrivals = retailProducts.slice(6, 12);

  const dbCategories = Array.from(
    new Set(retailProducts.map((p) => p.category.toUpperCase())),
  );
  const categoryLabels =
    dbCategories.length >= 6 ? dbCategories.slice(0, 6) : FALLBACK_CATEGORIES;

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
        className="relative mt-5 overflow-hidden rounded-xl"
        style={{ background: COLORS.beige }}
      >
        <div className="grid grid-cols-12 items-end gap-4 px-10 pt-12 pb-0">
          <div className="col-span-5 flex flex-col justify-center pb-12">
            <h1
              className="text-[34px] font-extrabold leading-[1.1] tracking-tight"
              style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
            >
              Vos produits orientaux
              <br />
              préférés,
              <br />
              <span style={{ color: COLORS.primary }}>livrés chez vous</span>
            </h1>
            <p
              className="mt-4 max-w-[300px] text-[13.5px] leading-relaxed"
              style={{ color: COLORS.muted }}
            >
              Faites vos courses en ligne et recevez-les
              <br />
              directement à domicile lors de nos tournées.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex w-fit items-center rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm"
              style={{ background: COLORS.primary }}
            >
              Voir nos produits
            </Link>
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

      <section
        className="mt-5 flex flex-wrap items-center justify-around gap-6 rounded-xl border bg-white px-8 py-5"
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
        <div className="mt-4 grid grid-cols-6 gap-3">
          {categoryLabels.map((label) => (
            <Link
              key={label}
              href={`/products?category=${encodeURIComponent(label)}`}
              className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
              style={{ borderColor: COLORS.border }}
            >
              <div className="h-[110px] w-full" style={{ background: COLORS.beige }} />
              <div className="w-full px-2 py-2.5 text-center">
                <div
                  className="text-[10px] font-bold tracking-wide"
                  style={{ color: COLORS.text }}
                >
                  {label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
            Épicerie orientale
            <br />
            livrée chez vous
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: COLORS.muted }}>
            Découvrez nos rayons
            <br />
            et commandez en quelques clics.
          </p>
        </div>
        <div className="col-span-3 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center rounded-md px-7 py-4 text-[14px] font-semibold text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            Voir le catalogue
          </Link>
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
        <div className="mt-4 grid grid-cols-6 gap-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
