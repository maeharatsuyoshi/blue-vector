import type { Metadata } from "next";
import News, { type NewsItemView } from "@/app/components/sections/News";
import { listNews } from "@/app/lib/news-queries";
import { getSiteImages } from "@/app/lib/site-images";
import { OG_IMAGE } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "News",
  description:
    "News, briefings, and announcements from BLUE VECTOR — firm updates, research perspectives, and commentary on the defence landscape.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News | BLUE VECTOR",
    description:
      "Firm updates, research perspectives, and commentary on the defence landscape.",
    url: "/news",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { images: [OG_IMAGE.url] },
};

export const revalidate = 600;

export default async function NewsPage() {
  const [rows, images] = await Promise.all([listNews(), getSiteImages()]);
  const items: NewsItemView[] = rows.map((r) => ({
    id: r.id,
    date: r.date_published,
    category_en: r.category_en,
    category_jp: r.category_jp,
    title_en: r.title_en,
    title_jp: r.title_jp,
    excerpt_en: r.excerpt_en,
    excerpt_jp: r.excerpt_jp,
    body_en: r.body_en,
    body_jp: r.body_jp,
    image: r.image,
  }));
  const heroImages = [images.news_hero_1, images.news_hero_2];
  return <News items={items} heroImages={heroImages} />;
}
