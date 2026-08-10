import type { Metadata } from "next";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/app/components/i18nProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "./components/themeProvider";

const satoshi = localFont({
  src: [
    // { path: "./fonts/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = "https://exchangoio.vercel.app";
const TITLE = "exchango | Smart Currency Converter";
const DESCRIPTION =
  "Convert currencies with real-time rates and a clean, mobile-first interface.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "currency converter, money exchange, exchango, exchange rates, free currency converter, simple currency converter, fast currency converter, convert currencies online",
  authors: [{ name: "exchango" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
  verification: {
    google: "T6EdMufxFF69EDDXSRDQ1PLZK33j2BKCRarWzzWCza0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${outfit.variable}`}
    >
      <head>
        <link
          href="https://cdn.boxicons.com/fonts/basic/boxicons.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.boxicons.com/fonts/brands/boxicons-brands.min.css"
          rel="stylesheet"
        />
      </head>

      <body className="font-satoshi">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>

        <Analytics />
        <GoogleAnalytics gaId="G-FMVFL5HVQE" />
      </body>
    </html>
  );
}
