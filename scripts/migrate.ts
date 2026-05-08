import { sql } from "./db";

async function main() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      date_published DATE NOT NULL,
      category_en TEXT NOT NULL,
      category_jp TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_jp TEXT NOT NULL,
      excerpt_en TEXT NOT NULL,
      excerpt_jp TEXT NOT NULL,
      body_en TEXT NOT NULL,
      body_jp TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      name_en TEXT NOT NULL,
      name_jp TEXT NOT NULL,
      role_en TEXT NOT NULL,
      role_jp TEXT NOT NULL,
      bio_en TEXT NOT NULL,
      bio_jp TEXT NOT NULL,
      initials TEXT NOT NULL,
      photo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_images (
      slot TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS image TEXT`;
  await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_founder BOOLEAN NOT NULL DEFAULT false`;
  await sql`UPDATE team_members SET is_founder = true WHERE slug IN ('uemura', 'maehara') AND is_founder = false`;
  await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'expert'`;
  await sql`UPDATE team_members SET category = 'founder' WHERE is_founder = true AND category = 'expert'`;

  await sql`CREATE INDEX IF NOT EXISTS news_date_idx ON news (date_published DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS team_sort_idx ON team_members (sort_order ASC)`;

  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
