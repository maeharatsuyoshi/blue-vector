import { notFound } from "next/navigation";
import CategoryForm from "../CategoryForm";
import { updateCategoryAction, type CategoryFormState } from "../actions";
import { getTeamCategory } from "@/app/lib/team-categories-queries";

export default async function EditCategoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const category = await getTeamCategory(numericId);
  if (!category) notFound();

  const action = async (
    prev: CategoryFormState | undefined,
    formData: FormData
  ): Promise<CategoryFormState> => {
    "use server";
    return updateCategoryAction(numericId, prev, formData);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Edit category
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {category.name_en}{" "}
          <span className="text-[var(--ink-muted)]">({category.slug})</span>
        </p>
      </div>
      <CategoryForm
        initial={category}
        action={action}
        submitLabel="Save changes"
      />
    </div>
  );
}
