-- Only presidents approve, decline, edit or remove alumni entries.
-- Run once in the SQL Editor. Safe to run more than once.
drop policy if exists "board edits" on public.alumni;
drop policy if exists "board deletes" on public.alumni;
drop policy if exists "presidents edit alumni" on public.alumni;
drop policy if exists "presidents delete alumni" on public.alumni;
create policy "presidents edit alumni" on public.alumni for update to authenticated using (public.is_president());
create policy "presidents delete alumni" on public.alumni for delete to authenticated using (public.is_president());
