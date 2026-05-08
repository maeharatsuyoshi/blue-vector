import { supabase } from "./db";

async function main() {
  const { data: news } = await supabase
    .from("news")
    .select("id, slug, image")
    .not("image", "is", null);
  const { data: team } = await supabase
    .from("team_members")
    .select("id, slug, photo")
    .not("photo", "is", null);
  const { data: imgs } = await supabase
    .from("site_images")
    .select("slot, url")
    .not("url", "is", null);

  console.log("\n=== news.image ===");
  console.table(news ?? []);
  console.log("\n=== team_members.photo ===");
  console.table(team ?? []);
  console.log("\n=== site_images.url ===");
  console.table(imgs ?? []);

  const all = [
    ...(news ?? []).map((r) => r.image as string),
    ...(team ?? []).map((r) => r.photo as string),
    ...(imgs ?? []).map((r) => r.url as string),
  ];
  const vercelBlob = all.filter((u) => u?.includes("public.blob.vercel-storage.com"));
  const supaStorage = all.filter((u) => u?.includes("supabase.co/storage"));
  const localPath = all.filter((u) => u?.startsWith("/"));
  const other = all.filter(
    (u) =>
      u &&
      !u.includes("public.blob.vercel-storage.com") &&
      !u.includes("supabase.co/storage") &&
      !u.startsWith("/")
  );

  console.log("\n=== Summary ===");
  console.log(`Vercel Blob URLs:   ${vercelBlob.length}`);
  console.log(`Supabase Storage:   ${supaStorage.length}`);
  console.log(`Local /public path: ${localPath.length}`);
  console.log(`Other:              ${other.length}`);
  if (other.length) console.log("  examples:", other.slice(0, 3));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
