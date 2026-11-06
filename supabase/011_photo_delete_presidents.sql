-- Only presidents delete individual photos (board members can still add them).
-- Run once in the SQL Editor. Safe to run more than once.
drop policy if exists "board deletes" on public.photos;
drop policy if exists "presidents delete photos" on public.photos;
create policy "presidents delete photos" on public.photos for delete to authenticated using (public.is_president());
drop policy if exists "board deletes photo files" on storage.objects;
drop policy if exists "presidents delete photo files" on storage.objects;
create policy "presidents delete photo files" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_president());
