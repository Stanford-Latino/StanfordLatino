-- ─────────────────────────────────────────────────────────────
-- Lets logged-in members add albums, events and themselves to the
-- alumni directory from the website (and edit/delete what they added).
-- Run once in the database's SQL Editor. Safe to run more than once.
-- (Already included at the bottom of schema.sql for new setups.)
-- ─────────────────────────────────────────────────────────────

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
