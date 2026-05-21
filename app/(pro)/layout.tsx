import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { ProSiteHeader } from "@/components/pro/site-header";
import { COLORS } from "@/lib/ui";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider audience="pro">
      <div className="flex min-h-screen flex-col" style={{ background: COLORS.bg }}>
        <ProSiteHeader />
        <div className="flex-1">{children}</div>
      </div>
    </CartProvider>
  );
}
