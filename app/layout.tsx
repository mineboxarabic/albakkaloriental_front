import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Le Bakkal Oriental | Épicerie Orientale & Halal en Ligne en France",
    template: "%s · Le Bakkal Oriental",
  },
  description:
    "Découvrez Le Bakkal Oriental, votre épicerie orientale et halal en ligne. Produits orientaux halal, ingrédients traditionnels et produits méditerranéens livrés partout en France.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          background: "#FAF8F2",
          color: "#171717",
          fontFamily: "var(--font-poppins), 'Satoshi', system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
