-- Lets the site look up the presidents' emails to send them notifications.
-- Run once in the SQL Editor. Safe to run more than once.
create or replace function public.president_emails()
returns setof text
language sql stable security definer set search_path = public
as $$
  select email from public.board_members where role = 'president' and public.is_member();
$$;
