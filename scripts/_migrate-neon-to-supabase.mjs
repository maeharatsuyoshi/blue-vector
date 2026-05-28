// TEMP one-off: copy deployment data from Neon -> Supabase (full replace, keep ids).
// Skips `users` (master uses Supabase Auth) and the unused site_images.filter column.
// Run: node scripts/_migrate-neon-to-supabase.mjs   (delete after use)
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";

const sql = neon(process.env.NEON_CONNECTION_STRING);
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Columns to write per table on the Supabase side (master schema).
const SITE_IMAGE_COLS = ["slot", "url", "top_fade", "bottom_fade", "updated_at"];

async function copyTable(table, rows, { pk = "id", transform } = {}) {
  // Delete everything currently in the Supabase table.
  // PostgREST requires a filter on delete; use an always-true filter.
  const del = await s.from(table).delete().not(pk, "is", null);
  if (del.error) throw new Error(`delete ${table}: ${del.error.message}`);

  if (rows.length === 0) {
    console.log(`  ${table}: source empty, left empty`);
    return;
  }
  const payload = transform ? rows.map(transform) : rows;
  const ins = await s.from(table).insert(payload).select(pk);
  if (ins.error) throw new Error(`insert ${table}: ${ins.error.message}`);
  console.log(`  ${table}: inserted ${ins.data.length} rows`);
}

async function main() {
  console.log("Reading from Neon...");
  const categories = await sql.query("SELECT * FROM team_categories ORDER BY id");
  const members = await sql.query("SELECT * FROM team_members ORDER BY id");
  const news = await sql.query("SELECT * FROM news ORDER BY id");
  const privacy = await sql.query("SELECT * FROM privacy_policy ORDER BY id");
  const images = await sql.query("SELECT * FROM site_images");

  console.log("Writing to Supabase (FK-safe order: categories -> members)...");
  // Members reference categories by slug, so categories must exist first.
  await copyTable("team_categories", categories);
  await copyTable("team_members", members);
  await copyTable("news", news);
  await copyTable("privacy_policy", privacy);
  await copyTable("site_images", images, {
    pk: "slot",
    transform: (r) => Object.fromEntries(SITE_IMAGE_COLS.map((c) => [c, r[c]])),
  });

  console.log("Copy complete.");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
