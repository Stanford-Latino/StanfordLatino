-- ─────────────────────────────────────────────────────────────
-- Lets logged-in members post jobs from the website (and remove their own).
-- Safe to run more than once. Also included in schema.sql and updates.sql.
-- ─────────────────────────────────────────────────────────────

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
