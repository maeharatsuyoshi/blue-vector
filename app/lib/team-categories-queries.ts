import "server-only";
import { supabaseAdmin } from "./supabase-server";

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

const COLUMNS =
  "id, slug, name_en, name_jp, description_en, description_jp, created_at";

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

function rank(slug: string): number {
  if (slug === "founder") return 0;
  if (slug === "expert") return 1;
  return 2;
}

function sortCategories<T extends TeamCategoryRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const r = rank(a.slug) - rank(b.slug);
    if (r !== 0) return r;
    if (a.created_at !== b.created_at)
      return a.created_at < b.created_at ? -1 : 1;
    return a.id - b.id;
  });
}

export async function listTeamCategories(): Promise<TeamCategoryRow[]> {
  const { data, error } = await supabaseAdmin
    .from("team_categories")
    .select(COLUMNS);
  if (error) throw error;
  return sortCategories(normalize((data ?? []) as Record<string, unknown>[]));
}

export async function listTeamCategoriesWithCounts(): Promise<TeamCategoryWithCount[]> {
  const [cats, members] = await Promise.all([
    supabaseAdmin.from("team_categories").select(COLUMNS),
    supabaseAdmin.from("team_members").select("category"),
  ]);
  if (cats.error) throw cats.error;
  if (members.error) throw members.error;

  const counts = new Map<string, number>();
  for (const m of (members.data ?? []) as { category: string | null }[]) {
    if (!m.category) continue;
    counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
  }

  const normalized = normalize((cats.data ?? []) as Record<string, unknown>[]);
  const withCounts: TeamCategoryWithCount[] = normalized.map((c) => ({
    ...c,
    member_count: counts.get(c.slug) ?? 0,
  }));
  return sortCategories(withCounts);
}

export async function getTeamCategory(id: number): Promise<TeamCategoryRow | null> {
  const { data, error } = await supabaseAdmin
    .from("team_categories")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalize([data as Record<string, unknown>])[0] ?? null;
}

export async function categoryMemberCount(slug: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);
  if (error) throw error;
  return count ?? 0;
}

export type TeamCategoryInput = Omit<TeamCategoryRow, "id" | "created_at">;

export async function createTeamCategory(input: TeamCategoryInput): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("team_categories")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: number }).id;
}

export async function updateTeamCategory(
  id: number,
  input: Omit<TeamCategoryInput, "slug">
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("team_categories")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTeamCategoryAndMembers(slug: string): Promise<void> {
  const del1 = await supabaseAdmin
    .from("team_members")
    .delete()
    .eq("category", slug);
  if (del1.error) throw del1.error;
  const del2 = await supabaseAdmin
    .from("team_categories")
    .delete()
    .eq("slug", slug);
  if (del2.error) throw del2.error;
}

export async function deleteTeamCategoryReassign(
  fromSlug: string,
  toSlug: string
): Promise<void> {
  const upd = await supabaseAdmin
    .from("team_members")
    .update({ category: toSlug })
    .eq("category", fromSlug);
  if (upd.error) throw upd.error;
  const del = await supabaseAdmin
    .from("team_categories")
    .delete()
    .eq("slug", fromSlug);
  if (del.error) throw del.error;
}

export async function deleteTeamCategoryEmpty(slug: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("team_categories")
    .delete()
    .eq("slug", slug);
  if (error) throw error;
}
