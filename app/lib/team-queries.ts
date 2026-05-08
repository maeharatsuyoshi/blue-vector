import "server-only";
import { supabaseAdmin } from "./supabase-server";

export type TeamRow = {
  id: number;
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

const COLUMNS =
  "id, slug, sort_order, is_founder, name_en, name_jp, role_en, role_jp, bio_en, bio_jp, initials, photo";

function normalize(rows: Record<string, unknown>[]): TeamRow[] {
  return rows.map((r) => ({
    id: r.id as number,
    slug: r.slug as string,
    sort_order: r.sort_order as number,
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
}

export async function listTeam(): Promise<TeamRow[]> {
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select(COLUMNS)
    .order("is_founder", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return normalize((data ?? []) as Record<string, unknown>[]);
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
