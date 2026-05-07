import type { Metadata } from "next";
import Hero from "@/app/components/sections/Hero";
import { getSiteImages } from "@/app/lib/site-images";
import { OG_IMAGE } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Defence & Security Consulting",
  description:
    "BLUE VECTOR — a private infrastructure firm vectoring the future of defence. Strategic advisory, community initiatives, technology incubation, and investment support across Japan's defence ecosystem.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BLUE VECTOR | Defence & Security Consulting",
    description:
      "Vectoring the future of defence — strategic advisory, technology incubation, and investment support.",
    url: "/",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { images: [OG_IMAGE.url] },
};

export const revalidate = 3600;

export default async function Home() {
  const images = await getSiteImages();
  const heroImages = [
    images.home_hero_1,
    images.home_hero_2,
    images.home_hero_3,
    images.home_hero_4,
  ];
  return <Hero images={heroImages} />;
}
