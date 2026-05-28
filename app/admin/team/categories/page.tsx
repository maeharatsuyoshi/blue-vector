import Link from "next/link";
import { listTeamCategoriesWithCounts } from "@/app/lib/team-categories-queries";
import DeleteCategoryButton from "./DeleteCategoryButton";
import MoveCategoryButtons from "./MoveCategoryButtons";

export default async function TeamCategoriesPage() {
  const categories = await listTeamCategoriesWithCounts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Team Categories
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/team"
            className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← Back to team
          </Link>
          <Link
            href="/admin/team/categories/new"
            className="bg-[var(--ink)] text-[var(--surface)] px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            + New category
          </Link>
        </div>
      </div>

      <div className="border border-[var(--rule)]">
        {categories.length === 0 ? (
          <div className="p-8 text-sm text-[var(--ink-soft)] text-center">
            No categories yet.
          </div>
        ) : (
          <ul>
            {categories.map((c, i) => (
              <li
                key={c.id}
                className="border-b border-[var(--rule)] last:border-b-0 px-5 py-4 flex items-start gap-4 hover:bg-[var(--surface-hover)] transition-colors"
              >
                <MoveCategoryButtons
                  id={c.id}
                  canMoveUp={i > 0}
                  canMoveDown={i < categories.length - 1}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-sm font-bold">
                      {c.name_en}
                    </span>
                    <span className="text-[11px] text-[var(--ink-soft)]">
                      / {c.name_jp}
                    </span>
                    <span className="text-[9px] tracking-[0.22em] uppercase font-semibold text-[var(--ink-muted)] border border-[var(--rule)] px-1.5 py-0.5">
                      {c.slug}
                    </span>
                  </div>
                  {c.description_en && (
                    <p className="mt-1.5 text-[12px] text-[var(--ink-soft)] line-clamp-2">
                      {c.description_en}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-muted)]">
                    {c.member_count}{" "}
                    {c.member_count === 1 ? "member" : "members"}
                  </span>
                  <Link
                    href={`/admin/team/categories/${c.id}`}
                    className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  >
                    Edit
                  </Link>
                  <DeleteCategoryButton
                    id={c.id}
                    name={c.name_en}
                    slug={c.slug}
                    memberCount={c.member_count}
                    otherCategories={categories
                      .filter((x) => x.slug !== c.slug)
                      .map((x) => ({ slug: x.slug, name: x.name_en }))}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
