import "server-only";
import { supabaseAdmin } from "./supabase-server";

export type NewsRow = {
  id: number;
  slug: string;
  date_published: string;
  category_en: string;
  category_jp: string;
  title_en: string;
  title_jp: string;
  excerpt_en: string;
  excerpt_jp: string;
  body_en: string;
  body_jp: string;
  sort_order: number;
  image: string | null;
};

const COLUMNS =
  "id, slug, date_published, category_en, category_jp, title_en, title_jp, excerpt_en, excerpt_jp, body_en, body_jp, sort_order, image";

function normalize(rows: Record<string, unknown>[]): NewsRow[] {
  return rows.map((r) => ({
    id: r.id as number,
    slug: r.slug as string,
    date_published:
      r.date_published instanceof Date
        ? (r.date_published as Date).toISOString().slice(0, 10)
        : (r.date_published as string),
    category_en: r.category_en as string,
    category_jp: r.category_jp as string,
    title_en: r.title_en as string,
    title_jp: r.title_jp as string,
    excerpt_en: r.excerpt_en as string,
    excerpt_jp: r.excerpt_jp as string,
    body_en: r.body_en as string,
    body_jp: r.body_jp as string,
    sort_order: r.sort_order as number,
    image: (r.image as string | null) ?? null,
  }));
}

export async function listNews(): Promise<NewsRow[]> {
  const { data, error } = await supabaseAdmin
    .from("news")
    .select(COLUMNS)
    .order("date_published", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return normalize((data ?? []) as Record<string, unknown>[]);
}

export async function getNews(id: number): Promise<NewsRow | null> {
  const { data, error } = await supabaseAdmin
    .from("news")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalize([data as Record<string, unknown>])[0] ?? null;
}

export type NewsInput = Omit<NewsRow, "id">;

export async function createNews(input: NewsInput): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("news")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: number }).id;
}

export async function updateNews(id: number, input: NewsInput): Promise<void> {
  const { error } = await supabaseAdmin
    .from("news")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNews(id: number): Promise<void> {
  const { error } = await supabaseAdmin.from("news").delete().eq("id", id);
  if (error) throw error;
}
