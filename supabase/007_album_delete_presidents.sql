-- Board members can rename albums; only presidents can delete them.
-- Run once in the SQL Editor. Safe to run more than once.
drop policy if exists "board deletes" on public.albums;
drop policy if exists "presidents delete albums" on public.albums;
create policy "presidents delete albums" on public.albums for delete to authenticated using (public.is_president());
