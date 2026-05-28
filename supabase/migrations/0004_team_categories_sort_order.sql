-- Adds a configurable sort_order to team_categories so admins can choose
-- the display order on the public /team page (previously hardcoded in
-- app/lib code: founder=0, expert=1, others=2).

alter table team_categories
  add column if not exists sort_order int not null default 0;

-- Backfill once: only when every row is still at the default 0, so re-running
-- the migration after an admin has reordered won't clobber their choices.
update team_categories set sort_order = case slug
    when 'founder' then 0
    when 'expert' then 1
    else 2
  end
  where (select count(*) from team_categories where sort_order <> 0) = 0;

create index if not exists team_categories_sort_idx
  on team_categories (sort_order asc);
