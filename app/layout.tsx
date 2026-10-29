import { getLanguage } from "@/lib/server-language";
import { LanguageProvider } from "@/components/language-provider";
import { BODY_FONT } from "@/lib/ui";
import { textDirection } from "@/lib/language";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { getCatalogAdmin } from "@/lib/catalog-admin";
import { CatalogAdminProvider } from "@/components/admin/catalog-admin-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLanguage();
  if (language === "ar") {
    return {
      title: {
        default: "البقال الشرقي | بقالة شرقية وحلال عبر الإنترنت في فرنسا",
        template: "%s · البقال الشرقي",
      },
      description:
        "البقال الشرقي، متجرك الإلكتروني للبقالة الشرقية والحلال: منتجات شرقية حلال ومكونات تقليدية ومنتجات متوسطية تصلك إلى باب بيتك.",
    };
  }
  return {
    title: {
      default:
        "Le Bakkal Oriental | Épicerie Orientale & Halal en Ligne en France",
      template: "%s · Le Bakkal Oriental",
    },
    description:
      "Découvrez Le Bakkal Oriental, votre épicerie orientale et halal en ligne. Produits orientaux halal, ingrédients traditionnels et produits méditerranéens livrés partout en France.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getLanguage();
  const admin = await getCatalogAdmin();
  return (
    <html
      lang={language}
      dir={textDirection(language)}
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
        />
        {language === "ar" && (
          <>
            <link
              rel="preload"
              href="/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2"
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/fonts/noto-kufi-arabic-arabic-wght-normal.woff2"
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          </>
        )}
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          background: "#FAF8F2",
          color: "#171717",
          fontFamily: BODY_FONT,
        }}
      >
        <LanguageProvider language={language}>
          <CatalogAdminProvider available={Boolean(admin)} editBaseUrl={admin?.editBaseUrl}>{children}</CatalogAdminProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
