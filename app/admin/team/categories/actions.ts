"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import {
  categoryMemberCount,
  createTeamCategory,
  deleteTeamCategoryAndMembers,
  deleteTeamCategoryEmpty,
  deleteTeamCategoryReassign,
  getTeamCategory,
  updateTeamCategory,
} from "@/app/lib/team-categories-queries";
import { slugify, uniqueSlug } from "@/app/lib/slug";

const CategorySchema = z.object({
  name_en: z.string().trim().min(1),
  name_jp: z.string().trim().min(1),
  description_en: z.string().trim().default(""),
  description_jp: z.string().trim().default(""),
});

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

type Parsed = z.infer<typeof CategorySchema>;

function parseForm(
  formData: FormData
): Parsed | { error: string; fieldErrors: Record<string, string[]> } {
  const raw = Object.fromEntries(formData);
  const result = CategorySchema.safeParse(raw);
  if (!result.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  return result.data;
}

function revalidateAll() {
  revalidatePath("/team");
  revalidatePath("/admin/team");
  revalidatePath("/admin/team/categories");
}

export async function createCategoryAction(
  _prev: CategoryFormState | undefined,
  formData: FormData
): Promise<CategoryFormState> {
  await verifySession();
  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  const slug = await uniqueSlug(
    "team_categories",
    slugify(parsed.name_en),
    `category-${Date.now()}`
  );
  await createTeamCategory({ ...parsed, slug });
  revalidateAll();
  redirect("/admin/team/categories");
}

export async function updateCategoryAction(
  id: number,
  _prev: CategoryFormState | undefined,
  formData: FormData
): Promise<CategoryFormState> {
  await verifySession();
  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await getTeamCategory(id);
  if (!existing) {
    return { error: "Category not found." };
  }
  await updateTeamCategory(id, parsed);
  revalidateAll();
  redirect("/admin/team/categories");
}

export type DeleteCategoryResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteCategoryAction(
  id: number,
  mode: "empty" | "delete-members" | "reassign",
  reassignToSlug?: string
): Promise<DeleteCategoryResult> {
  await verifySession();
  const existing = await getTeamCategory(id);
  if (!existing) {
    return { ok: false, error: "Category not found." };
  }

  const count = await categoryMemberCount(existing.slug);

  if (mode === "empty") {
    if (count > 0) {
      return {
        ok: false,
        error: `Category has ${count} member${count === 1 ? "" : "s"}. Choose another option.`,
      };
    }
    await deleteTeamCategoryEmpty(existing.slug);
  } else if (mode === "delete-members") {
    await deleteTeamCategoryAndMembers(existing.slug);
  } else if (mode === "reassign") {
    if (!reassignToSlug) {
      return { ok: false, error: "Select a category to reassign members to." };
    }
    if (reassignToSlug === existing.slug) {
      return { ok: false, error: "Cannot reassign to the same category." };
    }
    const target = await import("@/app/lib/team-categories-queries").then((m) =>
      m.listTeamCategories()
    );
    const exists = target.some((c) => c.slug === reassignToSlug) || reassignToSlug === "none";
    if (!exists) {
      return { ok: false, error: "Target category does not exist." };
    }
    await deleteTeamCategoryReassign(existing.slug, reassignToSlug);
  }

  revalidateAll();
  return { ok: true };
}
