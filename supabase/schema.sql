-- Tango online carte — run this once in the Supabase SQL editor.
-- It creates the two tables, their row-level security, and the photo bucket.
--
-- There is no `specials` table and no plat du jour anywhere in this app: the
-- carte is what the kitchen serves every day.

create table if not exists categories (
  id           text primary key,
  name         text not null,
  french       text,
  note         text,
  note_french  text,
  image_url    text,
  sort_order   int  not null default 0
);

create table if not exists dishes (
  id           text primary key,
  category_id  text not null references categories(id) on delete cascade,
  name         text not null,
  french       text,
  price        integer not null default 0,   -- whole FCFA; the franc has no subunit
  image_url    text,
  hint         text,                          -- placeholder label until a photo exists
  tags         text[] not null default '{}',  -- closed vocabulary, see src/lib/tags.js
  available    boolean not null default true,
  sort_order   int  not null default 0
);

create index if not exists dishes_category_idx on dishes (category_id, sort_order);

-- Row level security ------------------------------------------------------
-- Anyone may read the carte; only signed-in staff may change it. The panel
-- does NOT use Supabase Auth, so writes have to be opened up separately —
-- see supabase/open-writes.sql, and read its header before running it.

alter table categories enable row level security;
alter table dishes     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories', 'dishes'] loop
    execute format('drop policy if exists "public read %1$s" on %1$I', t);
    execute format('drop policy if exists "staff write %1$s" on %1$I', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true)', t);
    execute format(
      'create policy "staff write %1$s" on %1$I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Photo storage -----------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('tango-photos', 'tango-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read tango photos" on storage.objects;
drop policy if exists "staff write tango photos" on storage.objects;

create policy "public read tango photos" on storage.objects
  for select using (bucket_id = 'tango-photos');

create policy "staff write tango photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'tango-photos')
  with check (bucket_id = 'tango-photos');
