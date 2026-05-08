import type { Metadata } from "next";
import Team, {
  type TeamMemberView,
  type TeamCategoryView,
} from "@/app/components/sections/Team";
import { listTeam } from "@/app/lib/team-queries";
import { listTeamCategories } from "@/app/lib/team-categories-queries";
import { getSiteImages } from "@/app/lib/site-images";
import { OG_IMAGE } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Founding members of BLUE VECTOR — experienced operators from the Ministry of Defence, the Self-Defence Forces, and the private defence investment sector.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team | BLUE VECTOR",
    description:
      "Founding members — operators from the Ministry of Defence, the Self-Defence Forces, and the defence investment sector.",
    url: "/team",
    type: "profile",
    images: [OG_IMAGE],
  },
  twitter: { images: [OG_IMAGE.url] },
};

export const revalidate = 3600;

export default async function TeamPage() {
  const [rows, categoryRows, images] = await Promise.all([
    listTeam(),
    listTeamCategories(),
    getSiteImages(),
  ]);
  const members: TeamMemberView[] = rows.map((r) => ({
    id: r.id,
    category: r.category,
    name_en: r.name_en,
    name_jp: r.name_jp,
    role_en: r.role_en,
    role_jp: r.role_jp,
    bio_en: r.bio_en,
    bio_jp: r.bio_jp,
    photo: r.photo,
  }));
  const categories: TeamCategoryView[] = categoryRows.map((c) => ({
    slug: c.slug,
    name_en: c.name_en,
    name_jp: c.name_jp,
    description_en: c.description_en,
    description_jp: c.description_jp,
  }));
  const heroImages = [
    images.team_hero_1,
    images.team_hero_2,
    images.team_hero_3,
  ];
  return (
    <Team members={members} categories={categories} heroImages={heroImages} />
  );
}
