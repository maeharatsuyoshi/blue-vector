/**
 * One-shot Vercel Blob -> Supabase Storage migration.
 *
 * Walks news.image, team_members.photo, site_images.url. For each row whose
 * URL points at *.public.blob.vercel-storage.com, downloads the blob,
 * uploads it to the Supabase 'uploads' bucket, then rewrites the DB row
 * to point at the new public URL.
 *
 * Re-run safe: idempotent thanks to upsert: true. Already-migrated rows
 * (those whose URL no longer matches the Vercel host) are skipped naturally.
 *
 * Run: npx tsx scripts/migrate-blobs.ts
 */
import { supabase } from "./db";

const BUCKET = "uploads";
const VERCEL_HOST = ".public.blob.vercel-storage.com";

type Job =
  | { table: "news"; id: number; column: "image"; url: string }
  | { table: "team_members"; id: number; column: "photo"; url: string }
  | { table: "site_images"; id: string; column: "url"; url: string };

async function collectJobs(): Promise<Job[]> {
  const jobs: Job[] = [];

  const { data: news, error: newsErr } = await supabase
    .from("news")
    .select("id, image")
    .not("image", "is", null);
  if (newsErr) throw newsErr;
  for (const r of news ?? []) {
    const row = r as { id: number; image: string | null };
    if (row.image && row.image.includes(VERCEL_HOST)) {
      jobs.push({ table: "news", id: row.id, column: "image", url: row.image });
    }
  }

  const { data: team, error: teamErr } = await supabase
    .from("team_members")
    .select("id, photo")
    .not("photo", "is", null);
  if (teamErr) throw teamErr;
  for (const r of team ?? []) {
    const row = r as { id: number; photo: string | null };
    if (row.photo && row.photo.includes(VERCEL_HOST)) {
      jobs.push({
        table: "team_members",
        id: row.id,
        column: "photo",
        url: row.photo,
      });
    }
  }

  const { data: imgs, error: imgsErr } = await supabase
    .from("site_images")
    .select("slot, url")
    .not("url", "is", null);
  if (imgsErr) throw imgsErr;
  for (const r of imgs ?? []) {
    const row = r as { slot: string; url: string | null };
    if (row.url && row.url.includes(VERCEL_HOST)) {
      jobs.push({
        table: "site_images",
        id: row.slot,
        column: "url",
        url: row.url,
      });
    }
  }

  return jobs;
}

function objectPathFromUrl(url: string): string {
  // Vercel Blob URLs look like:
  //   https://<store-id>.public.blob.vercel-storage.com/uploads/123-abc.jpg
  // Strip leading slash and the optional "uploads/" prefix so the object
  // lands at the bucket root (consistent with the new upload route).
  const path = new URL(url).pathname.replace(/^\//, "");
  return path.startsWith("uploads/") ? path.slice("uploads/".length) : path;
}

async function processJob(job: Job): Promise<void> {
  const res = await fetch(job.url);
  if (!res.ok) {
    console.warn(`SKIP ${job.url} (HTTP ${res.status})`);
    return;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";
  const objectPath = objectPathFromUrl(job.url);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: true });
  if (uploadError) {
    console.error(`UPLOAD ${objectPath}: ${uploadError.message}`);
    return;
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const newUrl = pub.publicUrl;

  if (job.table === "news") {
    const { error } = await supabase
      .from("news")
      .update({ image: newUrl })
      .eq("id", job.id);
    if (error) throw error;
  } else if (job.table === "team_members") {
    const { error } = await supabase
      .from("team_members")
      .update({ photo: newUrl })
      .eq("id", job.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("site_images")
      .update({ url: newUrl })
      .eq("slot", job.id);
    if (error) throw error;
  }

  console.log(`✓ ${job.table}#${job.id} -> ${objectPath}`);
}

async function main() {
  const jobs = await collectJobs();
  console.log(`Found ${jobs.length} blob(s) to migrate.`);
  for (const job of jobs) {
    try {
      await processJob(job);
    } catch (err) {
      console.error(
        `FAIL ${job.table}#${job.id} (${job.url}):`,
        err instanceof Error ? err.message : err
      );
    }
  }
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
