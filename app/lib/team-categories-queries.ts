import "server-only";
import { sql } from "./db";

export type TeamCategoryRow = {
  id: number;
  slug: string;
  name_en: string;
  name_jp: string;
  description_en: string;
  description_jp: string;
  created_at: string;
};

export type TeamCategoryWithCount = TeamCategoryRow & {
  member_count: number;
};

function normalize(rows: Record<string, unknown>[]): TeamCategoryRow[] {
  return rows.map((r) => ({
    id: r.id as number,
    slug: r.slug as string,
    name_en: r.name_en as string,
    name_jp: r.name_jp as string,
    description_en: (r.description_en as string) ?? "",
    description_jp: (r.description_jp as string) ?? "",
    created_at: String(r.created_at),
  }));
}

export async function listTeamCategories(): Promise<TeamCategoryRow[]> {
  const rows = await sql`
    SELECT c.id, c.slug, c.name_en, c.name_jp,
           c.description_en, c.description_jp, c.created_at
    FROM team_categories c
    ORDER BY
      CASE c.slug WHEN 'founder' THEN 0 WHEN 'expert' THEN 1 ELSE 2 END ASC,
      c.created_at ASC,
      c.id ASC
  `;
  return normalize(rows as Record<string, unknown>[]);
}

export async function listTeamCategoriesWithCounts(): Promise<TeamCategoryWithCount[]> {
  const rows = await sql`
    SELECT c.id, c.slug, c.name_en, c.name_jp,
           c.description_en, c.description_jp, c.created_at,
           (SELECT COUNT(*)::int FROM team_members m WHERE m.category = c.slug) AS member_count
    FROM team_categories c
    ORDER BY
      CASE c.slug WHEN 'founder' THEN 0 WHEN 'expert' THEN 1 ELSE 2 END ASC,
      c.created_at ASC,
      c.id ASC
  `;
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: r.id as number,
    slug: r.slug as string,
    name_en: r.name_en as string,
    name_jp: r.name_jp as string,
    description_en: (r.description_en as string) ?? "",
    description_jp: (r.description_jp as string) ?? "",
    created_at: String(r.created_at),
    member_count: r.member_count as number,
  }));
}

export async function getTeamCategory(id: number): Promise<TeamCategoryRow | null> {
  const rows = await sql`
    SELECT id, slug, name_en, name_jp, description_en, description_jp, created_at
    FROM team_categories WHERE id = ${id}
  `;
  const list = normalize(rows as Record<string, unknown>[]);
  return list[0] ?? null;
}

export async function categoryMemberCount(slug: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS c FROM team_members WHERE category = ${slug}
  `;
  return (rows[0] as { c: number }).c;
}

export type TeamCategoryInput = Omit<TeamCategoryRow, "id" | "created_at">;

export async function createTeamCategory(input: TeamCategoryInput): Promise<number> {
  const rows = await sql`
    INSERT INTO team_categories (
      slug, name_en, name_jp, description_en, description_jp
    ) VALUES (
      ${input.slug}, ${input.name_en}, ${input.name_jp},
      ${input.description_en}, ${input.description_jp}
    )
    RETURNING id
  `;
  return (rows[0] as { id: number }).id;
}

export async function updateTeamCategory(
  id: number,
  input: Omit<TeamCategoryInput, "slug">
): Promise<void> {
  await sql`
    UPDATE team_categories SET
      name_en = ${input.name_en},
      name_jp = ${input.name_jp},
      description_en = ${input.description_en},
      description_jp = ${input.description_jp},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteTeamCategoryAndMembers(slug: string): Promise<void> {
  await sql`DELETE FROM team_members WHERE category = ${slug}`;
  await sql`DELETE FROM team_categories WHERE slug = ${slug}`;
}

export async function deleteTeamCategoryReassign(
  fromSlug: string,
  toSlug: string
): Promise<void> {
  await sql`UPDATE team_members SET category = ${toSlug} WHERE category = ${fromSlug}`;
  await sql`DELETE FROM team_categories WHERE slug = ${fromSlug}`;
}

export async function deleteTeamCategoryEmpty(slug: string): Promise<void> {
  await sql`DELETE FROM team_categories WHERE slug = ${slug}`;
}
