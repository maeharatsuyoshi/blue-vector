import { supabase } from "./db";

async function main() {
  const { data: team, error: teamErr } = await supabase
    .from("team_members")
    .select("id, name_en, photo")
    .like("photo", "/uploads/%");
  if (teamErr) throw teamErr;

  const { data: news, error: newsErr } = await supabase
    .from("news")
    .select("id, title_en, image")
    .like("image", "/uploads/%");
  if (newsErr) throw newsErr;

  const teamRows = team ?? [];
  const newsRows = news ?? [];

  console.log(`Team members still referencing /uploads/: ${teamRows.length}`);
  if (teamRows.length) console.table(teamRows);
  console.log(`News posts still referencing /uploads/: ${newsRows.length}`);
  if (newsRows.length) console.table(newsRows);

  if (teamRows.length === 0 && newsRows.length === 0) {
    console.log("✓ Safe to delete public/uploads/");
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
