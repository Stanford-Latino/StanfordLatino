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
