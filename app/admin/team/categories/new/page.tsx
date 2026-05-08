import CategoryForm from "../CategoryForm";
import { createCategoryAction } from "../actions";

export default function NewCategoryPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          New category
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Categories group team members on the public Team page. The English
          name becomes the slug used internally.
        </p>
      </div>
      <CategoryForm action={createCategoryAction} submitLabel="Create" />
    </div>
  );
}
