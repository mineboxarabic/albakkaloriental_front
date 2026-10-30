import { TranslatedText } from "@/components/translated-text";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Store,
  Tag,
  Headphones,
  ChevronRight,
  WifiOff,
  ShieldCheck,
  ChefHat,
  Wheat,
  ShoppingBag,
  Check,
} from "lucide-react";
import {
  getCategoryItems,
  getProducts,
  getUpcomingDeliveries,
} from "@/lib/catalog";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { buildCategoryNavigation } from "@/lib/catalog-navigation";
import { getLanguage, translator } from "@/lib/server-language";
import type { Language } from "@/lib/language";
import { COLORS, DISPLAY_FONT, INTER_FONT, MONO_FONT } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { DeliveryChecker } from "@/components/retail/delivery-checker";
import { getCompany } from "@/lib/company";
import {
  ArabicDealsSticker,
  ArabicPriceSticker,
} from "@/components/retail/arabic-promo-stickers";

// Match the "Planning de livraison hebdomadaire" typography.
const INTER = INTER_FONT;
const MONO = MONO_FONT;

export const revalidate = 60;

export default async function Home() {
  const language = await getLanguage();
  const t = translator(language);
  const [{ products: allProducts, backendDown }, deliveries, categories, company] =
    await Promise.all([
      getProducts({ audience: "retail", language }),
      getUpcomingDeliveries(4),
      getCategoryItems(),
      getCompany(),
    ]);

  const retailProducts = allProducts.slice(0, 12);
  const bestSellers = retailProducts.slice(0, 6);
  const newArrivals = retailProducts.slice(6, 12);

  const navigation = buildCategoryNavigation(categories, allProducts, language);
  const featured = navigation.filter((c) => c.isFeatured);
  const categoryDisplays = (featured.length > 0 ? featured : navigation).slice(
    0,
    6,
  );

  const serverDate = new Date().toISOString();

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16">
      {backendDown && (
        <div
          className="mt-4 flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[13px]"
          style={{
            borderColor: "#F2C400",
            background: "#FFFBEA",
            color: "#92740A",
          }}
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <TranslatedText
            value={
              "Le serveur est temporairement indisponible — le catalogue ne peut pas être chargé."
            }
          />{" "}
        </div>
      )}

      <DeliveryChecker deliveries={deliveries} serverDate={serverDate} whatsappNumber={company.whatsappNumber} />

      <section
        className="relative mt-5 overflow-hidden rounded-lg border shadow-[0_18px_44px_-26px_rgba(23,23,23,0.28)]"
        style={{
          background: "#FFFFFF",
          borderColor: COLORS.border,
          fontFamily: INTER,
        }}
      >
        <div className="grid grid-cols-1 items-end gap-4 px-6 pt-6 pb-0 lg:grid-cols-12 lg:px-8 lg:pt-8">
          <div className="flex flex-col justify-center pb-6 lg:col-span-5 lg:pb-10">
            <div
              className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.18em",
                color: COLORS.muted,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: COLORS.primary }}
              />
              <TranslatedText value={"Épicerie orientale"} />{" "}
            </div>
            <h1
              className="text-[26px] font-medium leading-[1.04] tracking-tight sm:text-[30px]"
              style={{ color: COLORS.text }}
            >
              <TranslatedText value={"Vos produits orientaux préférés,"} />{" "}
              <span style={{ color: COLORS.primary }}>
                <TranslatedText value={"livrés chez vous"} />
              </span>
            </h1>
            <p
              className="mt-2 max-w-[320px] text-[13px] leading-relaxed rtl:max-w-[380px]"
              style={{ color: COLORS.muted }}
            >
              <TranslatedText
                value={
                  "Faites vos courses en ligne et recevez-les directement à domicile lors de nos tournées."
                }
              />{" "}
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase transition-opacity hover:opacity-90"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.08em",
                background: COLORS.primary,
                color: "#FAF8F2",
              }}
            >
              <TranslatedText value={"Voir nos produits"} />{" "}
            </Link>
          </div>
          <div className="relative -mx-6 flex items-end justify-center lg:col-span-7 lg:mx-0">
            <Image
              src="/Assets/img/banner.png"
              alt={t("Produits orientaux")}
              width={780}
              height={520}
              className="relative z-0 block h-auto w-full max-w-[620px] object-contain"
              priority
            />
            {language === "ar" ? (
              <ArabicPriceSticker className="absolute end-3 top-2 h-[68px] w-[68px] sm:end-2 sm:h-[150px] sm:w-[150px]" />
            ) : (
              <Image
                src="/Assets/img/stick.png"
                alt={t("Prix justes tous les jours")}
                width={180}
                height={180}
                className="absolute end-3 top-2 h-[68px] w-[68px] rotate-[8deg] drop-shadow-md sm:end-2 sm:h-[150px] sm:w-[150px]"
              />
            )}
          </div>
        </div>
      </section>

      <section
        className="mt-5 grid grid-cols-2 gap-4 rounded-xl border bg-white px-5 py-5 lg:flex lg:flex-wrap lg:items-center lg:justify-around lg:gap-6 lg:px-8"
        style={{ borderColor: COLORS.border }}
      >
        <Feature
          icon={<Truck className="h-6 w-6" strokeWidth={1.8} />}
          title="LIVRAISON RAPIDE"
          sub={t("Partout en France")}
        />
        <Feature
          icon={<Store className="h-6 w-6" strokeWidth={1.8} />}
          title="CLICK & COLLECT"
          sub={t("Retrait en magasin")}
        />
        <Feature
          icon={<Tag className="h-6 w-6" strokeWidth={1.8} />}
          title="PRIX ACCESSIBLES"
          sub={t("Toute l'année")}
        />
        <Feature
          icon={<Headphones className="h-6 w-6" strokeWidth={1.8} />}
          title="SERVICE CLIENT"
          sub={t("À votre écoute")}
        />
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2
            className="text-[22px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            <TranslatedText value={"Nos catégories"} />{" "}
          </h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-[12px] font-semibold"
            style={{ color: COLORS.primary }}
          >
            <TranslatedText value={"Voir toutes les catégories"} />{" "}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {categoryDisplays.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.value)}`}
              className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="relative aspect-[4/3] w-full overflow-hidden"
                style={{ background: COLORS.beige }}
              >
                <Image
                  src={category.image}
                  alt=""
                  width={320}
                  height={220}
                  className={
                    category.imageFit === "contain"
                      ? "h-full w-full bg-white object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
                      : "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  }
                />
              </div>
              <div className="w-full px-2 py-2.5 text-center">
                <div
                  className="text-[10px] font-bold tracking-wide rtl:text-[12.5px]"
                  style={{ color: COLORS.text }}
                >
                  {category.label}
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
          {language === "ar" ? (
            <ArabicDealsSticker />
          ) : (
            <Image
              src="/Assets/img/stick1.png"
              alt={t("Les bons plans")}
              width={320}
              height={220}
              className="h-auto w-full max-w-[240px] object-contain"
            />
          )}
        </div>
        <div className="text-center lg:col-span-3 lg:text-start">
          <h3
            className="text-[26px] font-extrabold leading-[1.1] tracking-tight sm:text-[34px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            <TranslatedText
              value={"Épicerie orientale livrée chez vous"}
            />{" "}
          </h3>
          <p
            className="mt-3 text-[14px] leading-relaxed sm:text-[15px]"
            style={{ color: COLORS.muted }}
          >
            <TranslatedText
              value={"Découvrez nos rayons et commandez en quelques clics."}
            />{" "}
          </p>
        </div>
        <div className="flex justify-center lg:col-span-3">
          <Link
            href="/products"
            className="inline-flex items-center rounded-md px-7 py-3.5 text-[14px] font-semibold text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            <TranslatedText value={"Voir le catalogue"} />{" "}
          </Link>
        </div>
        <div className="hidden items-center justify-end lg:col-span-3 lg:flex">
          <Image
            src="/Assets/img/products.png"
            alt={t("Panier de courses")}
            width={480}
            height={380}
            className="h-auto w-full max-w-[360px] object-contain"
          />
        </div>
      </section>

      <section className="mt-12">
        {/* Section header */}
        <div className="text-center">
          <div
            className="mb-2.5 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.18em",
              color: COLORS.muted,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.primary }}
            />
            <TranslatedText value={"Épicerie orientale & halal"} />{" "}
          </div>
          <h2
            className="text-[24px] font-extrabold leading-tight tracking-tight sm:text-[28px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            <TranslatedText
              value={"Votre Épicerie Orientale et Halal en Ligne"}
            />{" "}
          </h2>
          <p
            className="mx-auto mt-3 max-w-[720px] text-[14px] leading-relaxed sm:text-[15px]"
            style={{ color: COLORS.muted }}
          >
            <TranslatedText
              value={
                "Bienvenue chez Le Bakkal Oriental, votre référence en matière d'épicerie orientale et de produits authentiques du bassin méditerranéen. Nous sélectionnons avec soin une large gamme de produits orientaux halal, d'épices, de conserves, de boissons, de douceurs traditionnelles et d'ingrédients indispensables à la préparation de recettes familiales riches en saveurs. Notre mission est de permettre à chacun de retrouver facilement les goûts authentiques de l'Orient grâce à une plateforme de courses halal en ligne simple, rapide et accessible partout en France."
              }
            />{" "}
          </p>
        </div>

        {/* Themed cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />,
              title: "Des Produits Orientaux Halal Sélectionnés avec Soin",
              text: "Chez Le Bakkal Oriental, nous accordons une importance particulière à la qualité et à l'authenticité de notre catalogue. Notre sélection de produits orientaux halal répond aux attentes des familles à la recherche de produits fiables, savoureux et respectueux de leurs habitudes alimentaires.",
            },
            {
              icon: <ChefHat className="h-6 w-6" strokeWidth={1.8} />,
              title: "Retrouvez Tous Vos Ingrédients Traditionnels Préférés",
              text: "Les grandes recettes orientales reposent sur des produits de qualité. C'est pourquoi nous mettons à votre disposition un vaste choix d'ingrédients traditionnels permettant de préparer des plats emblématiques tels que les tajines, couscous, pâtisseries orientales, soupes, grillades et autres spécialités familiales.",
            },
            {
              icon: <Wheat className="h-6 w-6" strokeWidth={1.8} />,
              title: "Une Large Sélection de Produits Méditerranéens",
              text: "La gastronomie méditerranéenne est reconnue dans le monde entier pour sa diversité et son authenticité. Le Bakkal Oriental vous propose une sélection de produits méditerranéens soigneusement choisis pour répondre aux attentes des amateurs de cuisine traditionnelle.",
            },
            {
              icon: <ShoppingBag className="h-6 w-6" strokeWidth={1.8} />,
              title: "Faites Vos Courses Halal En Ligne En Toute Simplicité",
              text: "Grâce à notre service de courses halal en ligne, commander vos produits préférés n'a jamais été aussi simple. Depuis chez vous, accédez à une large gamme de produits orientaux et méditerranéens et recevez vos commandes directement à votre domicile.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border bg-white p-5"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-md"
                style={{ background: COLORS.bg, color: COLORS.primary }}
              >
                {card.icon}
              </div>
              <h3
                className="mt-3.5 text-[16px] font-bold leading-snug tracking-tight"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                {t(card.title)}
              </h3>
              <p
                className="mt-2 text-[13.5px] leading-relaxed"
                style={{ color: COLORS.muted }}
              >
                {t(card.text)}
              </p>
            </div>
          ))}
        </div>

        {/* Why choose us band */}
        <div
          className="mt-8 rounded-2xl px-6 py-8 lg:px-10"
          style={{ background: COLORS.beige }}
        >
          <h3
            className="text-[20px] font-extrabold tracking-tight sm:text-[24px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            <TranslatedText
              value={"Pourquoi Choisir Le Bakkal Oriental ?"}
            />{" "}
          </h3>
          <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {[
              "Large choix de produits orientaux halal",
              "Produits authentiques et soigneusement sélectionnés",
              "Nombreux ingrédients traditionnels pour vos recettes",
              "Gamme variée de produits méditerranéens",
              "Service de courses halal en ligne pratique et sécurisé",
              "Livraison rapide partout en France",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[14px] leading-relaxed sm:text-[15px]"
                style={{ color: COLORS.text }}
              >
                <Check
                  className="mt-0.5 h-4.5 w-4.5 shrink-0"
                  strokeWidth={2.4}
                  style={{ color: COLORS.primary }}
                />
                {t(item)}
              </li>
            ))}
          </ul>
        </div>

        {/* Closing line */}
        <div className="mt-9 text-center">
          <h3
            className="text-[20px] font-extrabold tracking-tight sm:text-[24px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            <TranslatedText
              value={"Découvrez Les Saveurs Authentiques De L'Orient"}
            />{" "}
          </h3>
          <p
            className="mx-auto mt-3 max-w-[720px] text-[14px] leading-relaxed sm:text-[15px]"
            style={{ color: COLORS.muted }}
          >
            <TranslatedText
              value={
                "Le Bakkal Oriental met à l'honneur la richesse de la gastronomie orientale et méditerranéenne à travers une sélection de produits de qualité destinée aux particuliers comme aux passionnés de cuisine traditionnelle."
              }
            />{" "}
          </p>
        </div>
      </section>

      <ProductSection
        title="Les meilleures ventes"
        linkLabel={t("Voir tous les produits")}
        items={bestSellers}
        emptyLabel={t("Aucun produit disponible pour le moment.")}
        language={language}
      />
      <ProductSection
        title="Nouveautés"
        linkLabel={t("Voir toutes les nouveautés")}
        items={newArrivals}
        emptyLabel={t("Les nouveautés arriveront bientôt.")}
        language={language}
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
          <TranslatedText value={title} />
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
  language,
}: {
  title: string;
  linkLabel: string;
  items: ProductCardData[];
  emptyLabel: string;
  language: Language;
}) {
  return (
    <section className="mt-9">
      <div className="flex items-end justify-between">
        <h2
          className="text-[22px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          <TranslatedText value={title} />
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
            <ProductCard key={p.id} product={p} language={language} />
          ))}
        </div>
      )}
    </section>
  );
}
