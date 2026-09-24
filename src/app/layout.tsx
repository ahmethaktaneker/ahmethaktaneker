import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ahmethaktaneker.com"),
  openGraph: { type: "website", locale: "tr_TR", siteName: "Ahmet Haktan Eker" },
  twitter: { card: "summary_large_image" },
  title: "Ahmet Haktan Eker",
  description: "Ahmet Haktan Eker’in hukuk, toplum, kültür ve hayat üzerine yazıları.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body">
        <a href="#main-content" className="skip-link">İçeriğe geç</a>
        <SiteHeader />
        <main id="main-content" className="flex-1 flex flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
