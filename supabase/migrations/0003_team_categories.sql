-- Adds team categories support.
-- Brings the Supabase schema in line with the original Neon migrations
-- (introduced in main commit 89d8132 "categories finish").

alter table team_members
  add column if not exists category text not null default 'none';

update team_members
  set category = 'founder'
  where is_founder = true and category = 'none';

create table if not exists team_categories (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_jp text not null,
  description_en text not null default '',
  description_jp text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into team_categories (slug, name_en, name_jp, description_en, description_jp)
values (
  'founder',
  'Founding Members',
  '創業メンバー',
  'Our team is composed of members with practical experience in defence projects at the Ministry of Defence, the Self-Defence Forces, and the private sector. We provide comprehensive support from business development to proposal creation and implementation.',
  '防衛省・自衛隊、および民間で防衛プロジェクトの実務経験を有するメンバーで構成。新興防衛領域に参入するテック・スタートアップや関係企業に対し、事業開発から事業提案・実施まで一貫してサポートします。'
)
on conflict (slug) do nothing;

insert into team_categories (slug, name_en, name_jp, description_en, description_jp)
values (
  'expert',
  'Defense Experts',
  '防衛エキスパート',
  'Specialists with deep operational and technical expertise across the defence sector, supporting BLUE VECTOR engagements with focused subject-matter knowledge.',
  '防衛分野における運用・技術の高度な専門性を有するエキスパート。BLUE VECTORの各プロジェクトを専門知見で支援します。'
)
on conflict (slug) do nothing;

alter table team_categories enable row level security;

create policy "team_categories_public_select"
  on team_categories for select
  to anon, authenticated
  using (true);
