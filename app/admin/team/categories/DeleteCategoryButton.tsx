"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "./actions";

type Props = {
  id: number;
  name: string;
  slug: string;
  memberCount: number;
  otherCategories: { slug: string; name: string }[];
};

export default function DeleteCategoryButton({
  id,
  name,
  slug,
  memberCount,
  otherCategories,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"delete-members" | "reassign">(
    memberCount > 0 ? "reassign" : "delete-members"
  );
  const [target, setTarget] = useState<string>(
    otherCategories[0]?.slug ?? "none"
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const reassignOptions = [
    ...otherCategories.map((c) => ({ slug: c.slug, name: c.name })),
    { slug: "none", name: "(no category)" },
  ];

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const submittedMode = memberCount === 0 ? "empty" : mode;
      const result = await deleteCategoryAction(
        id,
        submittedMode,
        submittedMode === "reassign" ? target : undefined
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setMode(memberCount > 0 ? "reassign" : "delete-members");
          setOpen(true);
        }}
        className="text-[11px] tracking-[0.2em] uppercase font-semibold text-red-400 hover:text-red-300 cursor-pointer"
      >
        Delete
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--rule-strong)] p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="font-display text-lg font-bold">
                Delete category
              </h2>
              <p className="mt-1.5 text-[13px] text-[var(--ink-soft)]">
                Delete <span className="font-semibold text-[var(--ink)]">{name}</span>{" "}
                <span className="text-[var(--ink-muted)]">({slug})</span>
                {memberCount > 0 ? (
                  <>
                    {" — "}
                    <span className="text-red-400">
                      {memberCount}{" "}
                      {memberCount === 1 ? "member is" : "members are"}{" "}
                      assigned to this category.
                    </span>
                  </>
                ) : (
                  " — no members assigned."
                )}
              </p>
            </div>

            {memberCount > 0 && (
              <div className="space-y-3 border-t border-[var(--rule)] pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`del-mode-${id}`}
                    value="reassign"
                    checked={mode === "reassign"}
                    onChange={() => setMode("reassign")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[var(--ink)]">
                      Reassign members to another category
                    </div>
                    <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                      Members keep their profile; only the category is changed.
                    </p>
                    {mode === "reassign" && (
                      <select
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="mt-2 w-full bg-transparent border border-[var(--rule-strong)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      >
                        {reassignOptions.map((o) => (
                          <option
                            key={o.slug}
                            value={o.slug}
                            className="bg-[var(--surface)] text-[var(--ink)]"
                          >
                            {o.name} ({o.slug})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`del-mode-${id}`}
                    value="delete-members"
                    checked={mode === "delete-members"}
                    onChange={() => setMode("delete-members")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-red-400">
                      Delete category and all its members
                    </div>
                    <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                      All {memberCount}{" "}
                      {memberCount === 1 ? "member" : "members"} in this
                      category will be permanently removed.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {error && (
              <p className="text-[12px] text-red-400" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-4 pt-2 border-t border-[var(--rule)]">
              <button
                type="button"
                onClick={() => !pending && setOpen(false)}
                disabled={pending}
                className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="bg-red-500 text-white px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
              >
                {pending ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
