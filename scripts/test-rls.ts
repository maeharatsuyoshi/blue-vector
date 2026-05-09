/**
 * Verify Row Level Security is enforced for the anon role.
 *
 * Uses ONLY the public anon key (the one that ships in client bundles).
 * If anon can perform writes, RLS is broken or service-role is leaking.
 *
 * Run: npx tsx scripts/test-rls.ts
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let pass = 0;
let fail = 0;
function ok(label: string, msg: string) {
  pass++;
  console.log(`  ✓ ${label}: ${msg}`);
}
function bad(label: string, msg: string) {
  fail++;
  console.log(`  ✗ ${label}: ${msg}`);
}

async function main() {
  console.log("\n[A] Anon SELECT must succeed (public read policy)");
  for (const t of ["news", "team_members", "site_images"] as const) {
    const { data, error } = await anon.from(t).select("*").limit(1);
    if (error) bad(`anon SELECT ${t}`, `error: ${error.message}`);
    else ok(`anon SELECT ${t}`, `returned ${data?.length ?? 0} row(s)`);
  }

  console.log("\n[B] Anon INSERT must fail (no insert policy)");
  const inserts = [
    {
      table: "news",
      payload: {
        slug: "rls-attack-" + Date.now(),
        date_published: "2030-01-01",
        category_en: "x", category_jp: "x",
        title_en: "x", title_jp: "x",
        excerpt_en: "x", excerpt_jp: "x",
        body_en: "x", body_jp: "x",
      },
    },
    {
      table: "team_members",
      payload: {
        slug: "rls-attack-" + Date.now(),
        name_en: "x", name_jp: "x",
        role_en: "x", role_jp: "x",
        bio_en: "x", bio_jp: "x",
        initials: "X",
      },
    },
    {
      table: "site_images",
      payload: { slot: "rls_attack_" + Date.now(), url: "x" },
    },
  ] as const;

  for (const { table, payload } of inserts) {
    const { error } = await anon
      .from(table)
      .insert(payload as never);
    if (error) ok(`anon INSERT ${table}`, `BLOCKED: ${error.code ?? error.message}`);
    else bad(`anon INSERT ${table}`, `LEAKED: insert succeeded — RLS not enforced!`);
  }

  console.log("\n[C] Anon UPDATE must fail (no update policy)");
  for (const t of ["news", "team_members"] as const) {
    const { data, error } = await anon
      .from(t)
      .update({ slug: "rls-attack-" + Date.now() } as never)
      .gt("id", 0)
      .select();
    if (error) ok(`anon UPDATE ${t}`, `BLOCKED: ${error.code ?? error.message}`);
    else if ((data?.length ?? 0) === 0) ok(`anon UPDATE ${t}`, "0 rows affected (silently blocked)");
    else bad(`anon UPDATE ${t}`, `LEAKED: ${data?.length} rows updated!`);
  }

  console.log("\n[D] Anon DELETE must fail (no delete policy)");
  for (const t of ["news", "team_members"] as const) {
    const { data, error } = await anon
      .from(t)
      .delete()
      .gt("id", 0)
      .select();
    if (error) ok(`anon DELETE ${t}`, `BLOCKED: ${error.code ?? error.message}`);
    else if ((data?.length ?? 0) === 0) ok(`anon DELETE ${t}`, "0 rows affected (silently blocked)");
    else bad(`anon DELETE ${t}`, `LEAKED: ${data?.length} rows deleted!`);
  }

  console.log("\n[E] Anon Storage upload must fail (admin-only policy)");
  const fakeFile = Buffer.from("x");
  const { error: storErr } = await anon.storage
    .from("uploads")
    .upload(`rls-attack-${Date.now()}.txt`, fakeFile);
  if (storErr) ok("anon storage upload", `BLOCKED: ${storErr.message}`);
  else bad("anon storage upload", "LEAKED: anon could upload!");

  console.log(`\n========================================`);
  console.log(`  ${pass} passed, ${fail} failed`);
  console.log(`========================================\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
