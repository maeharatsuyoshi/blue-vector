import { sql } from "./db";

async function main() {
  const slug = "dummy-expert";

  const existing = await sql`SELECT id FROM team_members WHERE slug = ${slug}`;
  if (existing.length > 0) {
    console.log(`Member with slug "${slug}" already exists (id ${(existing[0] as { id: number }).id}). Skipping.`);
    return;
  }

  const name_en = "Hiroshi Tanaka";
  const name_jp = "田中 浩";
  const role_en = "Defense Technology Advisor";
  const role_jp = "防衛技術アドバイザー";
  const bio_en =
    "Former senior researcher at the Acquisition, Technology & Logistics Agency (ATLA) with 15 years of experience in defence technology assessment.\n\nSpecialises in unmanned systems, electronic warfare, and dual-use technology evaluation. Holds a PhD in Aerospace Engineering from the University of Tokyo and has authored over 40 peer-reviewed papers on emerging defence technologies.";
  const bio_jp =
    "防衛装備庁（ATLA）の元上席研究員。防衛技術評価において15年の経験を持つ。\n\n無人システム、電子戦、デュアルユース技術評価を専門とする。東京大学航空宇宙工学博士号を取得し、新興防衛技術に関する査読付き論文を40本以上執筆。";

  const rows = await sql`
    INSERT INTO team_members (
      slug, sort_order, is_founder, category,
      name_en, name_jp,
      role_en, role_jp,
      bio_en, bio_jp,
      initials, photo
    ) VALUES (
      ${slug}, 0, false, 'expert',
      ${name_en}, ${name_jp},
      ${role_en}, ${role_jp},
      ${bio_en}, ${bio_jp},
      'HT', NULL
    )
    RETURNING id
  `;
  console.log(`Inserted dummy expert (id ${(rows[0] as { id: number }).id}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
