-- ─────────────────────────────────────────────────────────────
-- ALL UPDATES IN ONE FILE (002 + 003 + 004).
-- If schema.sql was run before these features existed, run this once.
-- Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

-- ===== 002_member_posting =====

alter table public.events add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;
alter table public.albums add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;
alter table public.alumni add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;

drop policy if exists "members add events" on public.events;
create policy "members add events" on public.events for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members edit own events" on public.events;
create policy "members edit own events" on public.events for update to authenticated
  using (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own events" on public.events;
create policy "members delete own events" on public.events for delete to authenticated
  using (public.is_member() and created_by = auth.uid());

drop policy if exists "members add albums" on public.albums;
create policy "members add albums" on public.albums for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own albums" on public.albums;
create policy "members delete own albums" on public.albums for delete to authenticated
  using (public.is_member() and created_by = auth.uid());

drop policy if exists "members add alumni" on public.alumni;
create policy "members add alumni" on public.alumni for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members edit own alumni entry" on public.alumni;
create policy "members edit own alumni entry" on public.alumni for update to authenticated
  using (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own alumni entry" on public.alumni;
create policy "members delete own alumni entry" on public.alumni for delete to authenticated
  using (public.is_member() and created_by = auth.uid());

-- ===== 003_flyers_photos_board =====

alter table public.events add column if not exists flyer_path text;

create table if not exists public.board_members (
  email text primary key,
  name text,
  added_at timestamptz not null default now()
);
alter table public.board_members enable row level security;

drop policy if exists "see own board row" on public.board_members;
create policy "see own board row" on public.board_members for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

insert into public.board_members (email, name)
values ('manuelp1@stanford.edu', 'Manuel Palomares')
on conflict (email) do nothing;

-- ===== 004_member_jobs =====

alter table public.jobs add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;

drop policy if exists "members add jobs" on public.jobs;
create policy "members add jobs" on public.jobs for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists "members edit own jobs" on public.jobs;
create policy "members edit own jobs" on public.jobs for update to authenticated
  using (public.is_member() and created_by = auth.uid());
drop policy if exists "members delete own jobs" on public.jobs;
create policy "members delete own jobs" on public.jobs for delete to authenticated
  using (public.is_member() and created_by = auth.uid());
