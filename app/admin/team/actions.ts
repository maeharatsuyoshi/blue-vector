"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import {
  createTeamMember,
  deleteTeamMember,
  getTeamMember,
  listTeam,
  updateTeamMember,
} from "@/app/lib/team-queries";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { slugify, uniqueSlug } from "@/app/lib/slug";

const TeamSchema = z.object({
  sort_order: z.coerce.number().int().default(0),
  category: z.string().trim().min(1).default("none"),
  name_en: z.string().trim().min(1),
  name_jp: z.string().trim().min(1),
  role_en: z.string().trim().min(1),
  role_jp: z.string().trim().min(1),
  bio_en: z.string().trim().min(1),
  bio_jp: z.string().trim().min(1),
  photo: z
    .string()
    .trim()
    .transform((v) => (v.length === 0 ? null : v))
    .nullable()
    .default(null),
});

export type TeamFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

type Parsed = z.infer<typeof TeamSchema>;

function parseForm(
  formData: FormData
): Parsed | { error: string; fieldErrors: Record<string, string[]> } {
  const raw = Object.fromEntries(formData);
  const result = TeamSchema.safeParse(raw);
  if (!result.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  return result.data;
}

export async function createTeamAction(
  _prev: TeamFormState | undefined,
  formData: FormData
): Promise<TeamFormState> {
  await verifySession();
  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  const slug = await uniqueSlug(
    "team_members",
    slugify(parsed.name_en),
    `member-${Date.now()}`
  );
  await createTeamMember({
    ...parsed,
    slug,
    initials: "",
    is_founder: parsed.category === "founder",
  });
  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function updateTeamAction(
  id: number,
  _prev: TeamFormState | undefined,
  formData: FormData
): Promise<TeamFormState> {
  await verifySession();
  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await getTeamMember(id);
  if (!existing) {
    return { error: "Member not found." };
  }
  await updateTeamMember(id, {
    ...parsed,
    slug: existing.slug,
    initials: existing.initials,
    is_founder: parsed.category === "founder",
  });
  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function deleteTeamAction(id: number) {
  await verifySession();
  await deleteTeamMember(id);
  revalidatePath("/team");
  revalidatePath("/admin/team");
}

export async function moveTeamAction(id: number, direction: "up" | "down") {
  await verifySession();
  const all = await listTeam();
  const current = all.find((m) => m.id === id);
  if (!current) return;
  const siblings = all.filter((m) => m.category === current.category);
  const idx = siblings.findIndex((m) => m.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;
  const other = siblings[swapIdx];

  const aOrder = current.sort_order;
  const bOrder = other.sort_order;
  if (aOrder === bOrder) {
    await supabaseAdmin
      .from("team_members")
      .update({ sort_order: direction === "up" ? bOrder - 1 : bOrder + 1 })
      .eq("id", current.id);
  } else {
    await supabaseAdmin
      .from("team_members")
      .update({ sort_order: bOrder })
      .eq("id", current.id);
    await supabaseAdmin
      .from("team_members")
      .update({ sort_order: aOrder })
      .eq("id", other.id);
  }
  revalidatePath("/team");
  revalidatePath("/admin/team");
}
