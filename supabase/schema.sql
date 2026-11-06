-- ─────────────────────────────────────────────────────────────
-- Stanford Latino — database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

-- Who counts as a member. To let alumni in later, add their domain here
-- (and in lib/auth.ts), e.g.  or email ilike '%@alumni.stanford.edu'
create or replace function public.is_member()
returns boolean
language sql stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu';
$$;

-- ── Tables ──────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'social' check (category in ('social', 'career', 'speaker', 'philanthropy')),
  starts_at timestamptz not null,
  location text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  location text,
  job_type text,               -- e.g. Internship, Full-time
  apply_url text,
  description text,
  is_open boolean not null default true,
  posted_at timestamptz not null default now()
);

create table if not exists public.alumni (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  class_year int,
  major text,
  role text,
  company text,
  industry text,
  city text,
  linkedin_url text,
  email text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  storage_path text not null unique,
  uploaded_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── Access rules (Row Level Security) ───────────────────────
-- Logged-in @stanford.edu members can read everything.
-- Members can add photos and delete their own.
-- Everything else (events, jobs, alumni, albums) is edited by the board
-- in the Supabase dashboard, which bypasses these rules.
alter table public.events enable row level security;
alter table public.jobs   enable row level security;
alter table public.alumni enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;

drop policy if exists "members read events" on public.events;
create policy "members read events" on public.events for select to authenticated using (public.is_member());

drop policy if exists "members read jobs" on public.jobs;
create policy "members read jobs" on public.jobs for select to authenticated using (public.is_member());

drop policy if exists "members read alumni" on public.alumni;
create policy "members read alumni" on public.alumni for select to authenticated using (public.is_member());

drop policy if exists "members read albums" on public.albums;
create policy "members read albums" on public.albums for select to authenticated using (public.is_member());

drop policy if exists "members read photos" on public.photos;
create policy "members read photos" on public.photos for select to authenticated using (public.is_member());

drop policy if exists "members add photos" on public.photos;
create policy "members add photos" on public.photos for insert to authenticated
  with check (public.is_member() and uploaded_by = auth.uid());

drop policy if exists "members delete own photos" on public.photos;
create policy "members delete own photos" on public.photos for delete to authenticated
  using (public.is_member() and uploaded_by = auth.uid());

-- ── Photo storage (private bucket) ──────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "members view photo files" on storage.objects;
create policy "members view photo files" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.is_member());

drop policy if exists "members upload photo files" on storage.objects;
create policy "members upload photo files" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_member());

drop policy if exists "members delete own photo files" on storage.objects;
create policy "members delete own photo files" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_member() and owner = auth.uid());

-- ── Optional starter content (delete or edit in the Table Editor) ──
insert into public.albums (title, event_date)
select * from (values ('Welcome Social', current_date)) as v(title, event_date)
where not exists (select 1 from public.albums);

-- ── Member posting (same as 002_member_posting.sql) ──────────
alter table public.events add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;
alter table public.albums add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;
alter table public.alumni add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;

-- Events
drop policy if exists "members add events" on public.events;
create policy "members add events" on public.events for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members edit own events" on public.events;
create policy "members edit own events" on public.events for update to authenticated
  using (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own events" on public.events;
create policy "members delete own events" on public.events for delete to authenticated
  using (public.is_member() and created_by = auth.uid());

-- Albums
drop policy if exists "members add albums" on public.albums;
create policy "members add albums" on public.albums for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own albums" on public.albums;
create policy "members delete own albums" on public.albums for delete to authenticated
  using (public.is_member() and created_by = auth.uid());

-- Alumni directory (people add and edit their own entry)
drop policy if exists "members add alumni" on public.alumni;
create policy "members add alumni" on public.alumni for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members edit own alumni entry" on public.alumni;
create policy "members edit own alumni entry" on public.alumni for update to authenticated
  using (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own alumni entry" on public.alumni;
create policy "members delete own alumni entry" on public.alumni for delete to authenticated
  using (public.is_member() and created_by = auth.uid());
