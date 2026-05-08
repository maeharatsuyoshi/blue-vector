import Image from "next/image";
import Link from "next/link";
import { listTeam } from "@/app/lib/team-queries";
import { deleteTeamAction } from "./actions";

export default async function TeamAdminPage() {
  const team = await listTeam();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Team</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {team.length} {team.length === 1 ? "member" : "members"}
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="bg-[var(--ink)] text-[var(--surface)] px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          + New member
        </Link>
      </div>

      <div className="border border-[var(--rule)]">
        {team.length === 0 ? (
          <div className="p-8 text-sm text-[var(--ink-soft)] text-center">
            No team members yet.
          </div>
        ) : (
          <ul>
            {team.map((m) => (
              <li
                key={m.id}
                className="border-b border-[var(--rule)] last:border-b-0 px-5 py-4 flex items-center gap-4 hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="w-10 h-10 border border-[var(--rule-strong)] relative overflow-hidden flex items-center justify-center text-[8px] tracking-[0.15em] uppercase text-[var(--ink-muted)] shrink-0">
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={m.name_en}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    "No img"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold truncate">
                      {m.name_en}
                    </span>
                    {m.category === "founder" && (
                      <span className="text-[8px] tracking-[0.2em] uppercase font-bold text-[var(--surface)] bg-[var(--ink)] px-1.5 py-0.5">
                        Founder
                      </span>
                    )}
                    {m.category === "expert" && (
                      <span className="text-[8px] tracking-[0.2em] uppercase font-bold text-[var(--ink)] border border-[var(--rule-strong)] px-1.5 py-0.5">
                        Expert
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--ink-soft)] truncate">
                    {m.role_en}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-muted)]">
                    #{m.sort_order}
                  </span>
                  <Link
                    href={`/admin/team/${m.id}`}
                    className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteTeamAction(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-[11px] tracking-[0.2em] uppercase font-semibold text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
