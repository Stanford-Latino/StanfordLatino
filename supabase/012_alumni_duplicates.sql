-- Duplicate check for the alumni directory (sees pending requests too).
-- Run once in the SQL Editor. Safe to run more than once.
create or replace function public.alumni_duplicate(p_name text, p_year int, p_email text, p_linkedin text)
returns text
language sql stable security definer set search_path = public
as $$
  select status from public.alumni
  where public.is_member() and (
    (nullif(trim(p_email), '') is not null and lower(trim(email)) = lower(trim(p_email)))
    or (nullif(trim(p_linkedin), '') is not null
        and lower(regexp_replace(linkedin_url, '^https?://(www\.)?|/+$', '', 'g'))
          = lower(regexp_replace(p_linkedin, '^https?://(www\.)?|/+$', '', 'g')))
    or (lower(regexp_replace(trim(full_name), '\s+', ' ', 'g')) = lower(regexp_replace(trim(p_name), '\s+', ' ', 'g'))
        and (p_year is null or class_year is null or class_year = p_year)
        -- same name and year, but a different email or LinkedIn means a different person
        and not (nullif(trim(p_email), '') is not null and nullif(trim(email), '') is not null
                 and lower(trim(email)) <> lower(trim(p_email)))
        and not (nullif(trim(p_linkedin), '') is not null and nullif(trim(linkedin_url), '') is not null
                 and lower(regexp_replace(linkedin_url, '^https?://(www\.)?|/+$', '', 'g'))
                   <> lower(regexp_replace(p_linkedin, '^https?://(www\.)?|/+$', '', 'g'))))
  )
  order by (status = 'approved') desc
  limit 1;
$$;
