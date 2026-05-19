import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AlimExpress — Vos produits orientaux préférés, au meilleur prix",
  description:
    "Épicerie, produits frais, boissons, surgelés et hygiène. Livraison à domicile dans toute la France.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
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
