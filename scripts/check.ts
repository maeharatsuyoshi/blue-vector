import { supabase } from "./db";

const TABLES = ["news", "team_members", "site_images", "privacy_policy"] as const;

async function main() {
  console.log("Row counts (Supabase public schema):");
  const counts: Record<string, number | string> = {};
  for (const table of TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    counts[table] = error ? `error: ${error.message}` : (count ?? 0);
  }
  console.table(counts);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
