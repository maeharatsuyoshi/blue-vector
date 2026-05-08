"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TeamCategoryRow } from "@/app/lib/team-categories-queries";
import type { CategoryFormState } from "./actions";

type Action = (
  state: CategoryFormState | undefined,
  formData: FormData
) => Promise<CategoryFormState>;

export default function CategoryForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: TeamCategoryRow;
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    CategoryFormState | undefined,
    FormData
  >(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="English">
        <Field
          label="Name"
          name="name_en"
          defaultValue={initial?.name_en}
          errors={state?.fieldErrors?.name_en}
          required
        />
        <Field
          label="Description"
          name="description_en"
          defaultValue={initial?.description_en}
          errors={state?.fieldErrors?.description_en}
          textarea
          rows={4}
        />
      </Section>

      <Section title="日本語">
        <Field
          label="Name"
          name="name_jp"
          defaultValue={initial?.name_jp}
          errors={state?.fieldErrors?.name_jp}
          required
        />
        <Field
          label="Description"
          name="description_jp"
          defaultValue={initial?.description_jp}
          errors={state?.fieldErrors?.description_jp}
          textarea
          rows={4}
        />
      </Section>

      {state?.error && (
        <p className="text-[12px] text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-[var(--rule)]">
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--ink)] text-[var(--surface)] px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/team/categories"
          className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-[var(--rule)] first:border-t-0 first:pt-0">
      <h2 className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[var(--ink-soft)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  textarea = false,
  rows = 3,
  required = false,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  textarea?: boolean;
  rows?: number;
  required?: boolean;
  errors?: string[];
}) {
  const inputCls =
    "w-full bg-transparent border border-[var(--rule-strong)] px-3 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]";
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[10px] tracking-[0.22em] uppercase font-semibold text-[var(--ink-soft)] mb-2"
      >
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue}
          className={inputCls}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          required={required}
          defaultValue={defaultValue}
          className={inputCls}
        />
      )}
      {errors && errors.length > 0 && (
        <p className="mt-1.5 text-[11px] text-red-400">{errors[0]}</p>
      )}
    </div>
  );
}
