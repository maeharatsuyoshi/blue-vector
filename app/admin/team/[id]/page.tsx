import { notFound } from "next/navigation";
import TeamForm from "../TeamForm";
import { updateTeamAction, type TeamFormState } from "../actions";
import { getTeamMember } from "@/app/lib/team-queries";
import { listTeamCategories } from "@/app/lib/team-categories-queries";

export default async function EditTeamMemberPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const [member, categories] = await Promise.all([
    getTeamMember(numericId),
    listTeamCategories(),
  ]);
  if (!member) notFound();

  const action = async (
    prev: TeamFormState | undefined,
    formData: FormData
  ): Promise<TeamFormState> => {
    "use server";
    return updateTeamAction(numericId, prev, formData);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Edit team member
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{member.name_en}</p>
      </div>
      <TeamForm
        initial={member}
        action={action}
        submitLabel="Save changes"
        categories={categories.map((c) => ({ slug: c.slug, name: c.name_en }))}
      />
    </div>
  );
}
