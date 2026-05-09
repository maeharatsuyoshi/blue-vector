import "server-only";
import { supabaseAdmin } from "./supabase-server";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyWords(input: string, maxWords: number): string {
  const cleaned = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
  const words = cleaned
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0)
    .slice(0, maxWords);
  return words.join("");
}

type SlugTable = "news" | "team_members" | "team_categories";

async function slugExists(table: SlugTable, slug: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("slug")
    .eq("slug", slug)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function uniqueSlug(
  table: SlugTable,
  baseSlug: string,
  fallback: string
): Promise<string> {
  const base = baseSlug || fallback;
  let candidate = base;
  let i = 2;
  while (await slugExists(table, candidate)) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}
