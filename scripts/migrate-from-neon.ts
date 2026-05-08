/**
 * One-shot Neon -> Supabase data migrator.
 *
 * Replaces pg_dump/pg_restore. Reads every row from the four public tables
 * in Neon, truncates the matching Supabase tables, then re-inserts.
 *
 * Run: npx tsx scripts/migrate-from-neon.ts
 *
 * Requires in .env.local:
 *   NEON_CONNECTION_STRING       (source — Neon production database)
 *   NEXT_PUBLIC_SUPABASE_URL     (target)
 *   SUPABASE_SERVICE_ROLE_KEY    (target — bypasses RLS)
 *
 * Requires temporarily: @neondatabase/serverless. Reinstall with
 *   npm install --no-save @neondatabase/serverless
 * before running, then it gets cleaned up by the next `npm install`.
 */
import { neon } from "@neondatabase/serverless";
import { supabase } from "./db";

const neonUrl = process.env.NEON_CONNECTION_STRING;
if (!neonUrl) throw new Error("NEON_CONNECTION_STRING is not set");
const neonSql = neon(neonUrl);

type NewsRow = {
  slug: string;
  date_published: string;
  category_en: string;
  category_jp: string;
  title_en: string;
  title_jp: string;
  excerpt_en: string;
  excerpt_jp: string;
  body_en: string;
  body_jp: string;
  image: string | null;
  sort_order: number;
};

type TeamRow = {
  slug: string;
  sort_order: number;
  is_founder: boolean;
  name_en: string;
  name_jp: string;
  role_en: string;
  role_jp: string;
  bio_en: string;
  bio_jp: string;
  initials: string;
  photo: string | null;
};

type SiteImageRow = {
  slot: string;
  url: string;
  bottom_fade: string;
  top_fade: string;
};

type PrivacyRow = {
  id: number;
  title_en: string;
  title_jp: string;
  body_en: string;
  body_jp: string;
  agree_en: string;
  agree_jp: string;
  cancel_en: string;
  cancel_jp: string;
};

function asDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

async function migrateNews() {
  const rows = (await neonSql`
    SELECT slug, date_published, category_en, category_jp,
           title_en, title_jp, excerpt_en, excerpt_jp,
           body_en, body_jp, image, sort_order
    FROM news
    ORDER BY id ASC
  `) as Record<string, unknown>[];

  if (rows.length === 0) {
    console.log("news: 0 rows in Neon, skipping.");
    return;
  }

  const payload: NewsRow[] = rows.map((r) => ({
    slug: r.slug as string,
    date_published: asDateString(r.date_published),
    category_en: r.category_en as string,
    category_jp: r.category_jp as string,
    title_en: r.title_en as string,
    title_jp: r.title_jp as string,
    excerpt_en: r.excerpt_en as string,
    excerpt_jp: r.excerpt_jp as string,
    body_en: r.body_en as string,
    body_jp: r.body_jp as string,
    image: (r.image as string | null) ?? null,
    sort_order: (r.sort_order as number) ?? 0,
  }));

  const { error: delErr } = await supabase
    .from("news")
    .delete()
    .gt("id", 0);
  if (delErr) throw delErr;

  const { error } = await supabase.from("news").insert(payload);
  if (error) throw error;
  console.log(`news: migrated ${payload.length} rows.`);
}

async function migrateTeam() {
  const rows = (await neonSql`
    SELECT slug, sort_order, is_founder,
           name_en, name_jp, role_en, role_jp,
           bio_en, bio_jp, initials, photo
    FROM team_members
    ORDER BY id ASC
  `) as Record<string, unknown>[];

  if (rows.length === 0) {
    console.log("team_members: 0 rows in Neon, skipping.");
    return;
  }

  const payload: TeamRow[] = rows.map((r) => ({
    slug: r.slug as string,
    sort_order: (r.sort_order as number) ?? 0,
    is_founder: Boolean(r.is_founder),
    name_en: r.name_en as string,
    name_jp: r.name_jp as string,
    role_en: r.role_en as string,
    role_jp: r.role_jp as string,
    bio_en: r.bio_en as string,
    bio_jp: r.bio_jp as string,
    initials: r.initials as string,
    photo: (r.photo as string | null) ?? null,
  }));

  const { error: delErr } = await supabase
    .from("team_members")
    .delete()
    .gt("id", 0);
  if (delErr) throw delErr;

  const { error } = await supabase.from("team_members").insert(payload);
  if (error) throw error;
  console.log(`team_members: migrated ${payload.length} rows.`);
}

async function migrateSiteImages() {
  const rows = (await neonSql`
    SELECT slot, url,
           COALESCE(bottom_fade, '') AS bottom_fade,
           COALESCE(top_fade, '')    AS top_fade
    FROM site_images
  `) as Record<string, unknown>[];

  if (rows.length === 0) {
    console.log("site_images: 0 rows in Neon, skipping.");
    return;
  }

  const payload: SiteImageRow[] = rows.map((r) => ({
    slot: r.slot as string,
    url: r.url as string,
    bottom_fade: (r.bottom_fade as string) ?? "",
    top_fade: (r.top_fade as string) ?? "",
  }));

  // Use upsert so we don't have to delete; PK is `slot`.
  const { error } = await supabase
    .from("site_images")
    .upsert(payload, { onConflict: "slot" });
  if (error) throw error;
  console.log(`site_images: migrated ${payload.length} rows.`);
}

async function migratePrivacy() {
  // privacy_policy may not exist in older Neon DBs; tolerate that.
  let rows: Record<string, unknown>[] = [];
  try {
    rows = (await neonSql`
      SELECT id, title_en, title_jp, body_en, body_jp,
             agree_en, agree_jp, cancel_en, cancel_jp
      FROM privacy_policy
    `) as Record<string, unknown>[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("privacy_policy") || msg.includes("does not exist")) {
      console.log("privacy_policy: table missing in Neon, skipping.");
      return;
    }
    throw err;
  }

  if (rows.length === 0) {
    console.log("privacy_policy: 0 rows in Neon, skipping.");
    return;
  }

  const payload: PrivacyRow[] = rows.map((r) => ({
    id: r.id as number,
    title_en: (r.title_en as string) ?? "",
    title_jp: (r.title_jp as string) ?? "",
    body_en: (r.body_en as string) ?? "",
    body_jp: (r.body_jp as string) ?? "",
    agree_en: (r.agree_en as string) ?? "",
    agree_jp: (r.agree_jp as string) ?? "",
    cancel_en: (r.cancel_en as string) ?? "",
    cancel_jp: (r.cancel_jp as string) ?? "",
  }));

  const { error } = await supabase
    .from("privacy_policy")
    .upsert(payload, { onConflict: "id" });
  if (error) throw error;
  console.log(`privacy_policy: migrated ${payload.length} rows.`);
}

async function main() {
  console.log("Reading from Neon, writing to Supabase...\n");
  await migrateNews();
  await migrateTeam();
  await migrateSiteImages();
  await migratePrivacy();
  console.log("\nDone. Run `npm run db:check` to verify counts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
