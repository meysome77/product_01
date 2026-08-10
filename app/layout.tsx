import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "クラブマネージャー",
    template: "%s | クラブマネージャー",
  },
  description:
    "地域クラブ・スポーツ少年団のための、入会手続き・出欠管理・会費集金をまとめて扱える運営支援サービスです。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
