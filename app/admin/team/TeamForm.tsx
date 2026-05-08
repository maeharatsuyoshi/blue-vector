"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TeamRow } from "@/app/lib/team-queries";
import type { TeamFormState } from "./actions";
import ImageUpload from "../ImageUpload";

type Action = (
  state: TeamFormState | undefined,
  formData: FormData
) => Promise<TeamFormState>;

export default function TeamForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: TeamRow;
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<TeamFormState | undefined, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-6">
      <SelectField
        label="Category"
        name="category"
        defaultValue={initial?.category ?? "none"}
        options={[
          { value: "founder", label: "Founding member" },
          { value: "expert", label: "Defense expert" },
          { value: "none", label: "None" },
        ]}
        errors={state?.fieldErrors?.category}
      />

      <Field
        label="Sort order"
        name="sort_order"
        type="number"
        defaultValue={String(initial?.sort_order ?? 0)}
        errors={state?.fieldErrors?.sort_order}
      />

      <ImageUpload
        name="photo"
        label="Photo — optional"
        initialUrl={initial?.photo}
      />

      <Section title="English">
        <Field
          label="Name"
          name="name_en"
          defaultValue={initial?.name_en}
          errors={state?.fieldErrors?.name_en}
          required
        />
        <Field
          label="Role"
          name="role_en"
          defaultValue={initial?.role_en}
          errors={state?.fieldErrors?.role_en}
          required
        />
        <Field
          label="Bio"
          name="bio_en"
          defaultValue={initial?.bio_en}
          errors={state?.fieldErrors?.bio_en}
          textarea
          rows={6}
          required
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
          label="Role"
          name="role_jp"
          defaultValue={initial?.role_jp}
          errors={state?.fieldErrors?.role_jp}
          required
        />
        <Field
          label="Bio"
          name="bio_jp"
          defaultValue={initial?.bio_jp}
          errors={state?.fieldErrors?.bio_jp}
          textarea
          rows={6}
          required
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
          href="/admin/team"
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
    <div className="space-y-4 pt-4 border-t border-[var(--rule)]">
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
  type = "text",
  textarea = false,
  rows = 3,
  required = false,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
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
          type={type}
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

function SelectField({
  label,
  name,
  defaultValue,
  options,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
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
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={inputCls}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--surface)] text-[var(--ink)]">
            {o.label}
          </option>
        ))}
      </select>
      {errors && errors.length > 0 && (
        <p className="mt-1.5 text-[11px] text-red-400">{errors[0]}</p>
      )}
    </div>
  );
}
