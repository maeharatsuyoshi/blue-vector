import "server-only";
import { supabaseAdmin } from "./supabase-server";

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

const COLUMNS =
  "id, slug, sort_order, is_founder, category, name_en, name_jp, role_en, role_jp, bio_en, bio_jp, initials, photo";

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

function categoryRank(slug: string): number {
  if (slug === "founder") return 0;
  if (slug === "expert") return 1;
  if (slug === NO_CATEGORY) return 9999;
  return 2;
}

export async function listTeam(): Promise<TeamRow[]> {
  const [members, categories] = await Promise.all([
    supabaseAdmin.from("team_members").select(COLUMNS),
    supabaseAdmin.from("team_categories").select("slug, created_at"),
  ]);
  if (members.error) throw members.error;
  if (categories.error) throw categories.error;

  const catCreated = new Map<string, string>();
  for (const c of (categories.data ?? []) as { slug: string; created_at: string }[]) {
    catCreated.set(c.slug, c.created_at);
  }

  const rows = normalize((members.data ?? []) as Record<string, unknown>[]);
  rows.sort((a, b) => {
    const rankDiff = categoryRank(a.category) - categoryRank(b.category);
    if (rankDiff !== 0) return rankDiff;
    if (a.category === b.category) {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.id - b.id;
    }
    const aCreated = catCreated.get(a.category) ?? "";
    const bCreated = catCreated.get(b.category) ?? "";
    if (aCreated !== bCreated) return aCreated < bCreated ? -1 : 1;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.id - b.id;
  });
  return rows;
}

export async function getTeamMember(id: number): Promise<TeamRow | null> {
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalize([data as Record<string, unknown>])[0] ?? null;
}

export type TeamInput = Omit<TeamRow, "id">;

export async function createTeamMember(input: TeamInput): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: number }).id;
}

export async function updateTeamMember(
  id: number,
  input: TeamInput
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("team_members")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTeamMember(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("team_members")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
