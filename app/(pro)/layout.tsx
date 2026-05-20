import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { COLORS } from "@/lib/ui";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider storageKey="pro_cart">
      <div className="flex min-h-screen flex-col" style={{ background: COLORS.bg }}>
        {children}
      </div>
    </CartProvider>
  );
}
