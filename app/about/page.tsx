import type { Metadata } from "next";
import About from "@/app/components/sections/About";
import { getSiteImages } from "@/app/lib/site-images";
import { OG_IMAGE } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "BLUE VECTOR — Vision, Mission, Values. A private infrastructure firm for the defence and security ecosystem, established April 2026.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About BLUE VECTOR",
    description:
      "Vision, Mission, Values — a private infrastructure firm for Japan's defence and security ecosystem.",
    url: "/about",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { images: [OG_IMAGE.url] },
};

export default async function AboutPage() {
  const images = await getSiteImages();
  return <About background={images.about_bg} />;
}
