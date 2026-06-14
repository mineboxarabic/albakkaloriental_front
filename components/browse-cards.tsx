import Image from "next/image";
import Link from "next/link";
import { COLORS, productImage } from "@/lib/ui";

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
            {productCount} {productCount > 1 ? "produits" : "produit"}
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
}: {
  name: string;
  image: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="relative h-[90px] w-full overflow-hidden sm:h-[110px]"
        style={{ background: COLORS.beige }}
      >
        <Image
          src={image}
          alt=""
          width={320}
          height={220}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="w-full px-2 py-2.5 text-center">
        <div
          className="text-[11px] font-bold tracking-wide"
          style={{ color: COLORS.text }}
        >
          {name.toUpperCase()}
        </div>
      </div>
    </Link>
  );
}
