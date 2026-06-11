import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
});

const SITE_NAME = "Café Lumière";
const SITE_DESCRIPTION =
  "Café Lumière は、こだわりのコーヒーと手作りスイーツをご用意した隠れ家カフェです。";

export const metadata: Metadata = {
  title: `${SITE_NAME} | 静かな時間を、あなたに`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} | 静かな時間を、あなたに`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  telephone: "03-1234-5678",
  address: {
    "@type": "PostalAddress",
    streetAddress: "神宮前1-2-3",
    addressLocality: "渋谷区",
    addressRegion: "東京都",
    postalCode: "150-0001",
    addressCountry: "JP",
  },
  openingHours: ["Mo-Fr 08:00-20:00", "Sa-Su 09:00-21:00"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
