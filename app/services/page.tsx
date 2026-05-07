import type { Metadata } from "next";
import Services from "@/app/components/sections/Services";
import { getSiteImages } from "@/app/lib/site-images";
import { OG_IMAGE } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Four pillars of defence advisory: consulting, community initiatives, technology incubation, and investment support.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | BLUE VECTOR",
    description:
      "Defence consulting, community initiatives, technology incubation, and investment support.",
    url: "/services",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { images: [OG_IMAGE.url] },
};

export default async function ServicesPage() {
  const images = await getSiteImages();
  return <Services background={images.services_bg} />;
}
