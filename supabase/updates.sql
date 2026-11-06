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
-- ─────────────────────────────────────────────────────────────
-- Board-only editing + alumni requests.
--   • Board (emails in board_members): add, edit and delete everything,
--     approve alumni requests, and manage the board list.
--   • Members (any @stanford.edu): view only, plus they can request to be
--     added to the alumni directory. Requests stay hidden until approved.
-- Run once in the SQL Editor. Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

create or replace function public.is_board()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_member() and exists (
    select 1 from public.board_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Board list: board members can see, add and remove board emails.
drop policy if exists "see own board row" on public.board_members;
drop policy if exists "board sees board" on public.board_members;
create policy "board sees board" on public.board_members for select to authenticated
  using (public.is_board() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "board adds board" on public.board_members;
create policy "board adds board" on public.board_members for insert to authenticated
  with check (public.is_board());
drop policy if exists "board removes board" on public.board_members;
create policy "board removes board" on public.board_members for delete to authenticated
  using (public.is_board());

-- Remove the old "any member can post" rules.
drop policy if exists "members add events" on public.events;
drop policy if exists "members edit own events" on public.events;
drop policy if exists "members delete own events" on public.events;
drop policy if exists "members add albums" on public.albums;
drop policy if exists "members delete own albums" on public.albums;
drop policy if exists "members add photos" on public.photos;
drop policy if exists "members delete own photos" on public.photos;
drop policy if exists "members add jobs" on public.jobs;
drop policy if exists "members edit own jobs" on public.jobs;
drop policy if exists "members delete own jobs" on public.jobs;
drop policy if exists "members add alumni" on public.alumni;
drop policy if exists "members edit own alumni entry" on public.alumni;
drop policy if exists "members delete own alumni entry" on public.alumni;
drop policy if exists "members read alumni" on public.alumni;
drop policy if exists "members upload photo files" on storage.objects;
drop policy if exists "members delete own photo files" on storage.objects;

-- Board edits events, albums, photos and jobs.
do $$
declare t text;
begin
  foreach t in array array['events', 'albums', 'photos', 'jobs', 'alumni'] loop
    execute format('drop policy if exists "board adds" on public.%I', t);
    execute format('drop policy if exists "board edits" on public.%I', t);
    execute format('drop policy if exists "board deletes" on public.%I', t);
    execute format('create policy "board edits" on public.%I for update to authenticated using (public.is_board())', t);
    execute format('create policy "board deletes" on public.%I for delete to authenticated using (public.is_board())', t);
    if t <> 'alumni' then
      execute format('create policy "board adds" on public.%I for insert to authenticated with check (public.is_board())', t);
    end if;
  end loop;
end $$;

-- Alumni: approved entries are visible to members; requests wait for the board.
alter table public.alumni add column if not exists status text not null default 'approved';
alter table public.alumni drop constraint if exists alumni_status_check;
alter table public.alumni add constraint alumni_status_check check (status in ('pending', 'approved'));

drop policy if exists "members read approved alumni" on public.alumni;
create policy "members read approved alumni" on public.alumni for select to authenticated
  using (public.is_member() and (status = 'approved' or public.is_board() or created_by = auth.uid()));
drop policy if exists "board or request adds alumni" on public.alumni;
create policy "board or request adds alumni" on public.alumni for insert to authenticated
  with check (public.is_board() or (public.is_member() and status = 'pending' and created_by = auth.uid()));

-- Photo files: board uploads anything; members can upload only their alumni photo.
drop policy if exists "board or alumni photo upload" on storage.objects;
create policy "board or alumni photo upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (public.is_board() or (public.is_member() and name like 'alumni/%')));
drop policy if exists "board deletes photo files" on storage.objects;
create policy "board deletes photo files" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_board());
-- ─────────────────────────────────────────────────────────────
-- Only presidents can add or remove board members.
-- Run once in the SQL Editor. Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

alter table public.board_members add column if not exists role text not null default 'board';
alter table public.board_members drop constraint if exists board_members_role_check;
alter table public.board_members add constraint board_members_role_check check (role in ('president', 'board'));

update public.board_members set role = 'president' where lower(email) = 'manuelp1@stanford.edu';

create or replace function public.is_president()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_member() and exists (
    select 1 from public.board_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and role = 'president'
  );
$$;

drop policy if exists "board adds board" on public.board_members;
drop policy if exists "board removes board" on public.board_members;
drop policy if exists "presidents add board" on public.board_members;
drop policy if exists "presidents edit board" on public.board_members;
drop policy if exists "presidents remove board" on public.board_members;
create policy "presidents add board" on public.board_members for insert to authenticated with check (public.is_president());
create policy "presidents edit board" on public.board_members for update to authenticated using (public.is_president());
create policy "presidents remove board" on public.board_members for delete to authenticated using (public.is_president());
-- Board members can rename albums; only presidents can delete them.
-- Run once in the SQL Editor. Safe to run more than once.
drop policy if exists "board deletes" on public.albums;
drop policy if exists "presidents delete albums" on public.albums;
create policy "presidents delete albums" on public.albums for delete to authenticated using (public.is_president());
