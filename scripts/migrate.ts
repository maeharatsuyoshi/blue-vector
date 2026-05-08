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
  await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'none'`;
  await sql`UPDATE team_members SET category = 'founder' WHERE is_founder = true AND category = 'none'`;

  await sql`
    CREATE TABLE IF NOT EXISTS team_categories (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_jp TEXT NOT NULL,
      description_en TEXT NOT NULL DEFAULT '',
      description_jp TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    INSERT INTO team_categories (slug, name_en, name_jp, description_en, description_jp)
    VALUES (
      'founder',
      'Founding Members',
      '創業メンバー',
      'Our team is composed of members with practical experience in defence projects at the Ministry of Defence, the Self-Defence Forces, and the private sector. We provide comprehensive support from business development to proposal creation and implementation.',
      '防衛省・自衛隊、および民間で防衛プロジェクトの実務経験を有するメンバーで構成。新興防衛領域に参入するテック・スタートアップや関係企業に対し、事業開発から事業提案・実施まで一貫してサポートします。'
    )
    ON CONFLICT (slug) DO NOTHING
  `;

  await sql`
    INSERT INTO team_categories (slug, name_en, name_jp, description_en, description_jp)
    VALUES (
      'expert',
      'Defense Experts',
      '防衛エキスパート',
      'Specialists with deep operational and technical expertise across the defence sector, supporting BLUE VECTOR engagements with focused subject-matter knowledge.',
      '防衛分野における運用・技術の高度な専門性を有するエキスパート。BLUE VECTORの各プロジェクトを専門知見で支援します。'
    )
    ON CONFLICT (slug) DO NOTHING
  `;

  await sql`CREATE INDEX IF NOT EXISTS news_date_idx ON news (date_published DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS team_sort_idx ON team_members (sort_order ASC)`;
  await sql`CREATE INDEX IF NOT EXISTS team_category_idx ON team_members (category)`;

  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
