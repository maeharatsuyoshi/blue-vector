-- Enable Row Level Security on all four tables.
--
-- Threat model:
--   * The app reads/writes via SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
--   * The anon key is bundled in `proxy.ts` for auth cookie refresh and
--     could leak into client bundles if a developer ever uses the wrong
--     client. RLS makes that leak harmless: the anon role has no DML.
--   * Authenticated end-users do not exist in this app (admin only).
--
-- Policy: anon and authenticated roles get SELECT only. All writes
-- continue to flow through the service-role key in server actions.

alter table news enable row level security;
alter table team_members enable row level security;
alter table site_images enable row level security;
alter table privacy_policy enable row level security;

-- Public read access (matches what visitors see on /, /news, /team, /contact).
create policy "news_public_select"
  on news for select
  to anon, authenticated
  using (true);

create policy "team_public_select"
  on team_members for select
  to anon, authenticated
  using (true);

create policy "site_images_public_select"
  on site_images for select
  to anon, authenticated
  using (true);

create policy "privacy_public_select"
  on privacy_policy for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon/authenticated.
-- Writes only succeed via the service-role key, which bypasses RLS.

-- Storage bucket policies for the 'uploads' bucket:
--   * Reads: anyone (the bucket is public, but we add an explicit policy
--     so the intent is documented and we control it without a dashboard
--     toggle).
--   * Writes: authenticated admin users only. Defence in depth on top of
--     verifySession() in /api/admin/upload.

create policy "uploads_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'uploads');

create policy "uploads_admin_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'uploads'
    and coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      (auth.jwt() -> 'user_metadata' ->> 'role')
    ) = 'admin'
  );

create policy "uploads_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'uploads'
    and coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      (auth.jwt() -> 'user_metadata' ->> 'role')
    ) = 'admin'
  );

create policy "uploads_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'uploads'
    and coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      (auth.jwt() -> 'user_metadata' ->> 'role')
    ) = 'admin'
  );
