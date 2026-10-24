import Image from "next/image";
import Link from "next/link";
import { COLORS, productImage } from "@/lib/ui";
import { TranslatedText } from "@/components/translated-text";

/**
 * Brand card: logo (or placeholder) + brand name, links to the filtered catalog.
 * Shared by the retail (/marques) and pro (/pro/marques) landing pages.
 */
export function MarqueCard({
  name,
  imageUrl,
  href,
  productCount,
}: {
  name: string;
  imageUrl: string | null;
  href: string;
  productCount?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="relative flex h-[110px] w-full items-center justify-center overflow-hidden p-4 sm:h-[130px]"
        style={{ background: COLORS.beige }}
      >
        <Image
          src={productImage(imageUrl)}
          alt={name}
          width={220}
          height={140}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="w-full px-2 py-2.5 text-center">
        <div
          className="text-[12px] font-bold tracking-wide"
          style={{ color: COLORS.text }}
        >
          {name}
        </div>
        {typeof productCount === "number" && (
          <div className="mt-0.5 text-[11px]" style={{ color: COLORS.muted }}>
            <TranslatedText
              value={productCount > 1 ? "{count} produits" : "{count} produit"}
              params={{ count: productCount }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Category card: image + category name, links to the filtered catalog.
 * Shared by the retail (/categories) and pro (/pro/categories) landing pages.
 */
export function CategoryCard({
  name,
  image,
  href,
  imageFit = "cover",
}: {
  name: string;
  image: string;
  href: string;
  imageFit?: "cover" | "contain";
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ background: COLORS.beige }}
      >
        <Image
          src={image}
          alt=""
          width={320}
          height={220}
          className={
            imageFit === "contain"
              ? "h-full w-full bg-white object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
              : "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          }
        />
      </div>
      <div className="w-full px-2 py-2.5 text-center">
        <div
          className="text-[11px] font-bold tracking-wide rtl:text-[13px]"
          style={{ color: COLORS.text }}
        >
          {name.toUpperCase()}
        </div>
      </div>
    </Link>
  );
}

/**
 * Compact subcategory link with its own thumbnail. Packshot images (borrowed
 * from a product in the category) are shown whole on white; styled category
 * photography fills the frame.
 */
export function SubcategoryChip({
  name,
  image,
  imageFit = "cover",
  href,
  active = false,
}: {
  name: string;
  image: string;
  imageFit?: "cover" | "contain";
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group flex min-w-0 items-center gap-2.5 rounded-lg border bg-white p-1.5 pe-3 transition hover:border-[#3F561F] hover:shadow-sm"
      style={{ borderColor: active ? COLORS.primary : COLORS.border }}
    >
      <span
        className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md"
        style={{ background: imageFit === "contain" ? "#FFFFFF" : COLORS.beige }}
      >
        <Image
          src={image}
          alt=""
          width={96}
          height={96}
          className={
            imageFit === "contain"
              ? "h-full w-full object-contain p-0.5 transition duration-300 group-hover:scale-[1.05]"
              : "h-full w-full object-cover transition duration-300 group-hover:scale-[1.05]"
          }
        />
      </span>
      <span
        className="line-clamp-2 text-[12px] font-semibold leading-snug rtl:text-[13px]"
        style={{ color: active ? COLORS.primary : COLORS.text }}
      >
        {name}
      </span>
    </Link>
  );
}
