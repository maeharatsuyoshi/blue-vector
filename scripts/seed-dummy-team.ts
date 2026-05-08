import { sql } from "./db";

type Dummy = {
  slug: string;
  category: string;
  name_en: string;
  name_jp: string;
  role_en: string;
  role_jp: string;
  bio_en: string;
  bio_jp: string;
  initials: string;
};

async function ensureCategory(
  slug: string,
  name_en: string,
  name_jp: string,
  description_en: string,
  description_jp: string
) {
  const existing = await sql`SELECT id FROM team_categories WHERE slug = ${slug}`;
  if (existing.length > 0) {
    console.log(`Category "${slug}" already exists.`);
    return;
  }
  await sql`
    INSERT INTO team_categories (slug, name_en, name_jp, description_en, description_jp)
    VALUES (${slug}, ${name_en}, ${name_jp}, ${description_en}, ${description_jp})
  `;
  console.log(`Inserted category "${slug}".`);
}

async function ensureMember(d: Dummy) {
  const existing = await sql`SELECT id FROM team_members WHERE slug = ${d.slug}`;
  if (existing.length > 0) {
    console.log(`Member "${d.slug}" already exists. Skipping.`);
    return;
  }
  const rows = await sql`
    INSERT INTO team_members (
      slug, sort_order, is_founder, category,
      name_en, name_jp,
      role_en, role_jp,
      bio_en, bio_jp,
      initials, photo
    ) VALUES (
      ${d.slug}, 0, false, ${d.category},
      ${d.name_en}, ${d.name_jp},
      ${d.role_en}, ${d.role_jp},
      ${d.bio_en}, ${d.bio_jp},
      ${d.initials}, NULL
    )
    RETURNING id
  `;
  console.log(`Inserted member "${d.slug}" (id ${(rows[0] as { id: number }).id}, category=${d.category}).`);
}

async function main() {
  await ensureCategory(
    "ttemp",
    "Temp",
    "テンプ",
    "Temporary test category for layout verification.",
    "レイアウト確認用の一時的なテストカテゴリ。"
  );

  const dummies: Dummy[] = [
    {
      slug: "dummy-expert-1",
      category: "expert",
      name_en: "Hiroshi Tanaka",
      name_jp: "田中 浩",
      role_en: "Defense Technology Advisor",
      role_jp: "防衛技術アドバイザー",
      bio_en:
        "Former senior researcher at the Acquisition, Technology & Logistics Agency (ATLA) with 15 years of experience in defence technology assessment.\n\nSpecialises in unmanned systems, electronic warfare, and dual-use technology evaluation. Holds a PhD in Aerospace Engineering from the University of Tokyo.",
      bio_jp:
        "防衛装備庁（ATLA）の元上席研究員。防衛技術評価において15年の経験を持つ。\n\n無人システム、電子戦、デュアルユース技術評価を専門とする。東京大学航空宇宙工学博士号を取得。",
      initials: "HT",
    },
    {
      slug: "dummy-expert-2",
      category: "expert",
      name_en: "Mariko Saito",
      name_jp: "斎藤 真理子",
      role_en: "Cyber & Space Defence Specialist",
      role_jp: "サイバー・宇宙防衛スペシャリスト",
      bio_en:
        "Twenty years of operational experience across Japan's cyber defence and space situational awareness programmes. Previously seconded to the National Institute of Information and Communications Technology.\n\nHolds a Master's degree from the National Graduate Institute for Policy Studies and is a regular contributor to international policy forums on space security.",
      bio_jp:
        "日本のサイバー防衛および宇宙状況把握プログラムにおいて20年の実務経験を持つ。情報通信研究機構への出向経験あり。\n\n政策研究大学院大学で修士号を取得し、宇宙安全保障に関する国際政策フォーラムへの寄稿多数。",
      initials: "MS",
    },
    {
      slug: "dummy-temp-1",
      category: "ttemp",
      name_en: "Kenji Watanabe",
      name_jp: "渡辺 健司",
      role_en: "Test Member",
      role_jp: "テストメンバー",
      bio_en:
        "Placeholder profile used to verify that the temporary category renders correctly on the public team page.\n\nNot a real team member.",
      bio_jp:
        "テンプカテゴリの公開Teamページでの表示確認に用いるプレースホルダープロフィールです。\n\n実在するメンバーではありません。",
      initials: "KW",
    },
  ];

  for (const d of dummies) {
    await ensureMember(d);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
