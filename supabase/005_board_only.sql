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
