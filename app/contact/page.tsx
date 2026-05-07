import type { Metadata } from "next";
import Contact from "@/app/components/sections/Contact";
import { getSiteImages } from "@/app/lib/site-images";
import { getPrivacyContent } from "@/app/lib/privacy-content";
import { OG_IMAGE } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact BLUE VECTOR for advisory engagements, briefings, and general inquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | BLUE VECTOR",
    description:
      "Advisory engagements, briefings, and qualified inquiries.",
    url: "/contact",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { images: [OG_IMAGE.url] },
};

export default async function ContactPage() {
  const [images, privacy] = await Promise.all([
    getSiteImages(),
    getPrivacyContent(),
  ]);
  return <Contact background={images.contact_bg} privacy={privacy} />;
}
