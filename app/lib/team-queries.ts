import "server-only";
import { sql } from "./db";

export const NO_CATEGORY = "none" as const;

export type TeamRow = {
  id: number;
  slug: string;
  sort_order: number;
  is_founder: boolean;
  category: string;
  name_en: string;
  name_jp: string;
  role_en: string;
  role_jp: string;
  bio_en: string;
  bio_jp: string;
  initials: string;
  photo: string | null;
};

function normalize(rows: Record<string, unknown>[]): TeamRow[] {
  return rows.map((r) => {
    const rawCategory = (r.category as string | null | undefined) ?? "";
    const category =
      rawCategory.length > 0
        ? rawCategory
        : Boolean(r.is_founder)
          ? "founder"
          : NO_CATEGORY;
    return {
      id: r.id as number,
      slug: r.slug as string,
      sort_order: r.sort_order as number,
      is_founder: Boolean(r.is_founder),
      category,
      name_en: r.name_en as string,
      name_jp: r.name_jp as string,
      role_en: r.role_en as string,
      role_jp: r.role_jp as string,
      bio_en: r.bio_en as string,
      bio_jp: r.bio_jp as string,
      initials: r.initials as string,
      photo: (r.photo as string | null) ?? null,
    };
  });
}

export async function listTeam(): Promise<TeamRow[]> {
  const rows = await sql`
    SELECT m.id, m.slug, m.sort_order, m.is_founder, m.category,
           m.name_en, m.name_jp, m.role_en, m.role_jp,
           m.bio_en, m.bio_jp, m.initials, m.photo
    FROM team_members m
    LEFT JOIN team_categories c ON c.slug = m.category
    ORDER BY
      CASE m.category WHEN 'founder' THEN 0 WHEN 'expert' THEN 1 WHEN 'none' THEN 9999 ELSE 2 END ASC,
      c.created_at ASC NULLS LAST,
      m.sort_order ASC,
      m.id ASC
  `;
  return normalize(rows as Record<string, unknown>[]);
}

export async function getTeamMember(id: number): Promise<TeamRow | null> {
  const rows = await sql`
    SELECT id, slug, sort_order, is_founder, category, name_en, name_jp, role_en, role_jp,
           bio_en, bio_jp, initials, photo
    FROM team_members WHERE id = ${id}
  `;
  const list = normalize(rows as Record<string, unknown>[]);
  return list[0] ?? null;
}

export type TeamInput = Omit<TeamRow, "id">;

export async function createTeamMember(input: TeamInput): Promise<number> {
  const rows = await sql`
    INSERT INTO team_members (
      slug, sort_order, is_founder, category,
      name_en, name_jp,
      role_en, role_jp,
      bio_en, bio_jp,
      initials, photo
    ) VALUES (
      ${input.slug}, ${input.sort_order}, ${input.is_founder}, ${input.category},
      ${input.name_en}, ${input.name_jp},
      ${input.role_en}, ${input.role_jp},
      ${input.bio_en}, ${input.bio_jp},
      ${input.initials}, ${input.photo}
    )
    RETURNING id
  `;
  return (rows[0] as { id: number }).id;
}

export async function updateTeamMember(
  id: number,
  input: TeamInput
): Promise<void> {
  await sql`
    UPDATE team_members SET
      slug = ${input.slug},
      sort_order = ${input.sort_order},
      is_founder = ${input.is_founder},
      category = ${input.category},
      name_en = ${input.name_en},
      name_jp = ${input.name_jp},
      role_en = ${input.role_en},
      role_jp = ${input.role_jp},
      bio_en = ${input.bio_en},
      bio_jp = ${input.bio_jp},
      initials = ${input.initials},
      photo = ${input.photo},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteTeamMember(id: number): Promise<void> {
  await sql`DELETE FROM team_members WHERE id = ${id}`;
}
