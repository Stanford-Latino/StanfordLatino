-- ─────────────────────────────────────────────────────────────
-- Event flyers, and a board list (board members can bulk-upload alumni).
-- Run once in the database's SQL Editor. Safe to run more than once.
-- (Already included at the bottom of schema.sql for new setups.)
-- ─────────────────────────────────────────────────────────────

alter table public.events add column if not exists flyer_path text;

-- Board members: add or remove emails in the Table Editor each year.
create table if not exists public.board_members (
  email text primary key,
  name text,
  added_at timestamptz not null default now()
);
alter table public.board_members enable row level security;

-- Each person can only check whether they themselves are on the board.
drop policy if exists "see own board row" on public.board_members;
create policy "see own board row" on public.board_members for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

insert into public.board_members (email, name)
values ('manuelp1@stanford.edu', 'Manuel Palomares')
on conflict (email) do nothing;
