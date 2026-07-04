import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { SessionProvider, type ClientSession } from "@/components/session-provider";
import { AuthModalProvider } from "@/components/auth-modal";
import { SiteHeader } from "@/components/retail/site-header";
import { SiteFooter } from "@/components/retail/site-footer";
import { CartDrawer } from "@/components/retail/cart-drawer";
import { PendingCartIntentConsumer } from "@/components/retail/pending-cart-intent-consumer";
import { CookieBanner } from "@/components/cookie-banner";
import { getRetailSession } from "@/lib/session";
import { getCategories } from "@/lib/catalog";
import { COLORS } from "@/lib/ui";
import { company } from "@/lib/company";

export default async function RetailLayout({ children }: { children: ReactNode }) {
  const [session, categories] = await Promise.all([
    getRetailSession(),
    getCategories("retail"),
  ]);
  const isRetail = session !== null;
  const sessionValue: ClientSession = {
    isConnected: !!isRetail,
    type: isRetail ? "retail" : null,
    name: isRetail ? session!.name : null,
  };

  return (
    <SessionProvider value={sessionValue}>
      <CartProvider audience="retail">
        <AuthModalProvider>
          <div className="flex min-h-screen flex-col overflow-x-clip" style={{ background: COLORS.bg }}>
            <SiteHeader categories={categories} phone={company.phone} />
            <CartDrawer />
            <PendingCartIntentConsumer />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <CookieBanner />
        </AuthModalProvider>
      </CartProvider>
    </SessionProvider>
  );
}
