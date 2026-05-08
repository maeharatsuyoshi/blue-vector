-- blue-vector schema (Supabase)
-- Source of truth for tables. Apply via Supabase SQL editor or `supabase db push`.
-- The `users` table is intentionally absent — Supabase Auth (auth.users) replaces it.

create table if not exists news (
  id serial primary key,
  slug text unique not null,
  date_published date not null,
  category_en text not null,
  category_jp text not null,
  title_en text not null,
  title_jp text not null,
  excerpt_en text not null,
  excerpt_jp text not null,
  body_en text not null,
  body_jp text not null,
  image text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists team_members (
  id serial primary key,
  slug text unique not null,
  sort_order integer not null default 0,
  is_founder boolean not null default false,
  name_en text not null,
  name_jp text not null,
  role_en text not null,
  role_jp text not null,
  bio_en text not null,
  bio_jp text not null,
  initials text not null,
  photo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_images (
  slot text primary key,
  url text not null,
  bottom_fade text not null default '',
  top_fade text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists privacy_policy (
  id integer primary key,
  title_en text not null default '',
  title_jp text not null default '',
  body_en text not null default '',
  body_jp text not null default '',
  agree_en text not null default '',
  agree_jp text not null default '',
  cancel_en text not null default '',
  cancel_jp text not null default '',
  updated_at timestamptz not null default now(),
  constraint privacy_singleton check (id = 1)
);

create index if not exists news_date_idx on news (date_published desc);
create index if not exists team_sort_idx on team_members (sort_order asc);

-- RLS deliberately NOT enabled. Writes go through service-role key in server
-- actions; reads use the service-role key as well (no client-side reads).
