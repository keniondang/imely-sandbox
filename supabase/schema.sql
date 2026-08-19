-- Run this once in Supabase's SQL Editor (dashboard -> SQL Editor -> New query)
-- to set up translation storage for the imely-sandbox tool.

create table if not exists translations (
  key text not null,
  locale text not null check (locale in ('zh-TW', 'th')),
  text text not null,
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);

-- No login system in this tool (translators just open a shared link), so
-- access is controlled by who has the anon key/URL rather than by user
-- accounts. These policies let anyone with that key read and write rows —
-- appropriate for an internal tool passed around a translator team, not for
-- anything exposed publicly.
alter table translations enable row level security;

create policy "Public read" on translations
  for select using (true);

create policy "Public upsert" on translations
  for insert with check (true);

create policy "Public update" on translations
  for update using (true);

create policy "Public delete" on translations
  for delete using (true);
