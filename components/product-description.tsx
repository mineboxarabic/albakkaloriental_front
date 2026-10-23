import type { ProductCard } from "@/lib/catalog";
export function ProductDescription({
  product,
  language,
}: {
  product: ProductCard;
  language: "fr" | "ar";
}) {
  return (
    <section className="mt-7 text-sm text-[#6B665D]">
      {product.subcategoryLabel && (
        <p className="mb-3">{product.subcategoryLabel}</p>
      )}
      {product.description && (
        <div className="rounded-lg border border-[#DDD8CC] bg-white p-5">
          <h2 className="mb-2 font-semibold text-[#171717]">
            {language === "ar" ? "وصف المنتج" : "Description du produit"}
          </h2>
          <p className="whitespace-pre-line leading-relaxed" dir="auto">
            {product.description}
          </p>
        </div>
      )}
      {(product.tags?.length ?? 0) > 0 && (
        <ul
          aria-label={language === "ar" ? "الوسوم" : "Tags"}
          className="mt-3 flex flex-wrap gap-2"
        >
          {product.tags!.map((tag) => (
            <li
              className="rounded-full bg-[#F0EBDD] px-3 py-1 text-xs"
              key={tag}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
