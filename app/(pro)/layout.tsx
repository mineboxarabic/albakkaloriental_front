import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { ProSiteHeader } from "@/components/pro/site-header";
import { getProMe } from "@/actions/pro-me";
import { COLORS } from "@/lib/ui";
import { getLanguage } from "@/lib/server-language";
import { getLocalizedProductNames } from "@/lib/catalog-navigation-server";

export default async function ProLayout({ children }: { children: ReactNode }) {
  const language = await getLanguage();
  const [meRes, productNames] = await Promise.all([
    getProMe(),
    getLocalizedProductNames("pro", language),
  ]);
  const authenticated = meRes.ok;

  return (
    <CartProvider
      audience="pro"
      isAuthenticated={authenticated}
      productNames={productNames}
    >
      <div className="flex min-h-screen flex-col" style={{ background: COLORS.bg }}>
        <ProSiteHeader authenticated={authenticated} />
        <div className="flex-1">{children}</div>
      </div>
    </CartProvider>
  );
}
