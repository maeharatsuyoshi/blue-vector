"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import {
  createTeamMember,
  deleteTeamMember,
  getTeamMember,
  updateTeamMember,
} from "@/app/lib/team-queries";
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
