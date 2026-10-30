import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import {
  SessionProvider,
  type ClientSession,
} from "@/components/session-provider";
import { AuthModalProvider } from "@/components/auth-modal";
import { SiteHeader } from "@/components/retail/site-header";
import { SiteFooter } from "@/components/retail/site-footer";
import { CartDrawer } from "@/components/retail/cart-drawer";
import { PendingCartIntentConsumer } from "@/components/retail/pending-cart-intent-consumer";
import { CookieBanner } from "@/components/cookie-banner";
import { getRetailSession } from "@/lib/session";
import { getCatalogShell } from "@/lib/catalog-navigation-server";
import { getLanguage } from "@/lib/server-language";
import { COLORS } from "@/lib/ui";
import { getCompany } from "@/lib/company";
import { getCatalogAdmin } from "@/lib/catalog-admin";
import { CatalogAdminProvider } from "@/components/admin/catalog-admin-provider";

export default async function RetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  const language = await getLanguage();
  const [session, { navigation: categories, productNames }, company] = await Promise.all([
    getRetailSession(),
    getCatalogShell("retail", language),
    getCompany(),
  ]);
  const isRetail = session !== null;
  const admin = isRetail ? await getCatalogAdmin('retail') : null;
  const sessionValue: ClientSession = {
    isConnected: !!isRetail,
    type: isRetail ? "retail" : null,
    name: isRetail ? session!.name : null,
  };

  return (
    <SessionProvider value={sessionValue}>
      <CatalogAdminProvider key={admin?.userId ?? 'guest'} audience="retail" available={Boolean(admin)} editBaseUrl={admin?.editBaseUrl}>
        <CartProvider audience="retail" productNames={productNames}>
          <AuthModalProvider>
            <div
              className="flex min-h-screen flex-col overflow-x-clip"
              style={{ background: COLORS.bg }}
            >
              <SiteHeader categories={categories} phone={company.phone} />
              <CartDrawer />
              <PendingCartIntentConsumer />
              <div className="flex-1">{children}</div>
              <SiteFooter categories={categories} />
            </div>
            <CookieBanner />
          </AuthModalProvider>
        </CartProvider>
      </CatalogAdminProvider>
    </SessionProvider>
  );
}
