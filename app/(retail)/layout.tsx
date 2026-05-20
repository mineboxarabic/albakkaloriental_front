import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/retail/site-header";
import { SiteFooter } from "@/components/retail/site-footer";
import { COLORS } from "@/lib/ui";

export default function RetailLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider storageKey="retail_cart">
      <div className="flex min-h-screen flex-col" style={{ background: COLORS.bg }}>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </CartProvider>
  );
}
