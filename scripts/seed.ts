import { supabase } from "./db";
import { content } from "../app/lib/content";

async function seedNews() {
  const { count, error: countError } = await supabase
    .from("news")
    .select("id", { count: "exact", head: true });
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    console.log("News already seeded, skipping.");
    return;
  }

  const en = content.en.news.items;
  const jp = content.jp.news.items;

  const rows = en.map((e, i) => {
    const j = jp.find((x) => x.id === e.id) ?? e;
    return {
      slug: e.id,
      date_published: e.date,
      sort_order: i,
      category_en: e.category,
      category_jp: j.category,
      title_en: e.title,
      title_jp: j.title,
      excerpt_en: e.excerpt,
      excerpt_jp: j.excerpt,
      body_en: e.body,
      body_jp: j.body,
    };
  });

  const { error } = await supabase.from("news").insert(rows);
  if (error) throw error;
  console.log(`Seeded ${rows.length} news items.`);
}

async function seedTeam() {
  const { count, error: countError } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true });
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    console.log("Team already seeded, skipping.");
    return;
  }

  const en = content.en.team.members;
  const jp = content.jp.team.members;

  const rows = en.map((e, i) => {
    const j = jp.find((x) => x.id === e.id) ?? e;
    return {
      slug: e.id,
      sort_order: i,
      is_founder: e.id === "uemura" || e.id === "maehara",
      name_en: e.name,
      name_jp: j.name,
      role_en: e.role,
      role_jp: j.role,
      bio_en: e.bio,
      bio_jp: j.bio,
      initials: e.initials,
      photo: e.photo,
    };
  });

  const { error } = await supabase.from("team_members").insert(rows);
  if (error) throw error;
  console.log(`Seeded ${rows.length} team members.`);
}

async function main() {
  await seedNews();
  await seedTeam();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
