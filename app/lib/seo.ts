export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bluevector.co.jp";
export const SITE_NAME = "BLUE VECTOR";
export const SITE_LEGAL_NAME = "BLUE VECTOR Inc.";
export const SITE_DESCRIPTION =
  "BLUE VECTOR is a private infrastructure firm providing defence and security consulting, strategic advisory, community initiatives, technology incubation, and investment support.";
export const SITE_TAGLINE = "Vectoring the Future of Defense";

export const OG_IMAGE = {
  url: "/link-image.png",
  width: 1897,
  height: 1077,
  alt: "BLUE VECTOR — Defence & Security Consulting",
} as const;

export const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/BLUE VECTOR logo_word.png`,
  description: SITE_DESCRIPTION,
  slogan: SITE_TAGLINE,
  foundingDate: "2026-04",
  areaServed: "JP",
  knowsAbout: [
    "Defence consulting",
    "National security advisory",
    "Strategic assessment",
    "Defence technology",
    "Defence investment",
  ],
} as const;

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["en", "ja"],
  publisher: { "@type": "Organization", name: SITE_LEGAL_NAME },
} as const;
