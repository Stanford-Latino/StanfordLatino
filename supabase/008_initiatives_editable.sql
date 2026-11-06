-- ─────────────────────────────────────────────────────────────
-- Initiative pages editable by presidents: cover photo, intro text and past events.
-- Public pages read these; only presidents can change them.
-- Run once in the SQL Editor. Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.initiative_settings (
  slug text primary key,
  photo_path text,
  body text,
  updated_at timestamptz not null default now()
);

create table if not exists public.initiative_events (
  id uuid primary key default gen_random_uuid(),
  initiative text not null,
  name text not null,
  date_label text,
  description text,
  photo_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.initiative_settings enable row level security;
alter table public.initiative_events enable row level security;

do $$
declare t text;
begin
  foreach t in array array['initiative_settings', 'initiative_events'] loop
    execute format('drop policy if exists "anyone reads" on public.%I', t);
    execute format('drop policy if exists "presidents add" on public.%I', t);
    execute format('drop policy if exists "presidents edit" on public.%I', t);
    execute format('drop policy if exists "presidents delete" on public.%I', t);
    execute format('create policy "anyone reads" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "presidents add" on public.%I for insert to authenticated with check (public.is_president())', t);
    execute format('create policy "presidents edit" on public.%I for update to authenticated using (public.is_president())', t);
    execute format('create policy "presidents delete" on public.%I for delete to authenticated using (public.is_president())', t);
  end loop;
end $$;

-- Public bucket for photos shown on public pages (initiatives).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'])
on conflict (id) do update set public = true;

drop policy if exists "presidents upload site files" on storage.objects;
create policy "presidents upload site files" on storage.objects for insert to authenticated
  with check (bucket_id = 'site' and public.is_president());
drop policy if exists "presidents delete site files" on storage.objects;
create policy "presidents delete site files" on storage.objects for delete to authenticated
  using (bucket_id = 'site' and public.is_president());

-- Starting content (the current placeholders), only if empty.
insert into public.initiative_events (initiative, name, date_label, description, position)
select * from (values
  ('comunidad', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 1),
  ('comunidad', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 2),
  ('comunidad', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 3),
  ('speaker-series', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 1),
  ('speaker-series', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 2),
  ('speaker-series', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 3),
  ('philanthropy', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 1),
  ('philanthropy', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 2),
  ('philanthropy', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 3),
  ('relations', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 1),
  ('relations', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 2),
  ('relations', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 3),
  ('internships', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 1),
  ('internships', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 2),
  ('internships', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 3),
  ('marketing', 'Estanfor Hats', '[Month YYYY]', 'Our staple, much-loved Estanfor hats. [Add the story behind them.]', 0),
  ('marketing', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 1),
  ('marketing', '[Event name]', '[Month DD, YYYY]', '[A sentence or two about the event: who came, what happened.]', 2)
) as v(initiative, name, date_label, description, position)
where not exists (select 1 from public.initiative_events);
