import type { Metadata, Viewport } from "next";
import { Inter, Jost, Libre_Baskerville, Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Shell from "@/app/components/Shell";
import {
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SITE_DESCRIPTION,
  OG_IMAGE,
  ORG_JSON_LD,
  WEBSITE_JSON_LD,
} from "@/app/lib/seo";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Libre_Baskerville({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const heroFont = Jost({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jp = Noto_Sans_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Defence & Security Consulting`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "BLUE VECTOR",
    "defence consulting",
    "security consulting",
    "national security",
    "intelligence advisory",
    "strategic assessment",
    "Japan defence",
    "defence technology",
    "defence investment",
    "防衛コンサルティング",
    "安全保障",
  ],
  authors: [{ name: SITE_LEGAL_NAME, url: SITE_URL }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  category: "Defence & Security",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ja: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: `${SITE_NAME} | Defence & Security Consulting`,
    description:
      "Defence and security consulting and strategic advisory. Supporting defence innovation, policy strategy, and ecosystem development.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Defence & Security Consulting`,
    description:
      "Defence and security consulting and strategic advisory. Supporting defence innovation, policy strategy, and ecosystem development.",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a1f3d" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1f3d" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${heroFont.variable} ${jp.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--surface)] text-[var(--ink)]">
        <Shell>{children}</Shell>
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          // JSON-LD must be raw JSON; React would otherwise escape quotes.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </body>
    </html>
  );
}
