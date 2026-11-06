'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUser } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';

export type FormState = { ok?: boolean; error?: string; message?: string };

const text = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max) || null;

async function memberClient() {
  const user = await getUser();
  if (!user || !isAllowedEmail(user.email)) return null;
  return createClient();
}

/** Turn a "2026-11-20T18:30" (Stanford time) into a real timestamp. */
function stanfordTimeToISO(local: string) {
  const [d, t = '00:00'] = local.split('T');
  const guess = new Date(`${d}T${t}:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'shortOffset' })
    .formatToParts(guess)
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-8';
  const m = parts.match(/GMT([+-]\d+)(?::(\d+))?/);
  const hours = m ? Number(m[1]) : -8;
  const mins = m && m[2] ? Number(m[2]) * Math.sign(hours) : 0;
  return new Date(guess.getTime() - (hours * 60 + mins) * 60000).toISOString();
}

export async function createAlbum(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await memberClient();
  if (!supabase) return { error: 'Please log in again.' };
  const title = text(f, 'title', 120);
  if (!title) return { error: 'Give the album a name.' };
  const { error } = await supabase.from('albums').insert({ title, event_date: text(f, 'event_date', 10) });
  if (error) return { error: 'Couldn’t create the album. Try again.' };
  revalidatePath('/members/photos');
  return { ok: true, message: `Album “${title}” created.` };
}

export async function createEvent(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await memberClient();
  if (!supabase) return { error: 'Please log in again.' };
  const title = text(f, 'title', 120);
  const when = text(f, 'starts_at', 16);
  const category = text(f, 'category', 20) ?? 'social';
  if (!title || !when) return { error: 'Add a name and a date/time.' };
  if (!['social', 'career', 'speaker', 'philanthropy'].includes(category)) return { error: 'Pick a type.' };
  const { error } = await supabase.from('events').insert({
    title,
    category,
    starts_at: stanfordTimeToISO(when),
    location: text(f, 'location', 160),
    description: text(f, 'description', 600),
    flyer_path: storedPath(f, 'flyer_path', 'flyers/'),
  });
  if (error) return { error: 'Couldn’t add the event. Try again.' };
  revalidatePath('/members/events');
  return { ok: true, message: `“${title}” is on the calendar.` };
}

export async function addAlum(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await memberClient();
  if (!supabase) return { error: 'Please log in again.' };
  const full_name = text(f, 'full_name', 120);
  if (!full_name) return { error: 'Add your name.' };
  const yearRaw = text(f, 'class_year', 4);
  const class_year = yearRaw ? Number(yearRaw) : null;
  if (class_year !== null && (!Number.isInteger(class_year) || class_year < 1950 || class_year > 2100)) {
    return { error: 'Class year should look like 2027.' };
  }
  let linkedin_url = text(f, 'linkedin_url', 300);
  if (linkedin_url && !/^https?:\/\//i.test(linkedin_url)) linkedin_url = `https://${linkedin_url}`;
  const { error } = await supabase.from('alumni').insert({
    full_name,
    class_year,
    major: text(f, 'major', 120),
    role: text(f, 'role', 120),
    company: text(f, 'company', 120),
    industry: text(f, 'industry', 80),
    city: text(f, 'city', 120),
    linkedin_url,
    email: text(f, 'email', 200),
    photo_url: storedPath(f, 'photo_path', 'alumni/'),
  });
  if (error) return { error: 'Couldn’t add this person to the directory. Try again.' };
  revalidatePath('/members/alumni');
  return { ok: true, message: `${full_name} is in the directory.` };
}

export async function createJob(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await memberClient();
  if (!supabase) return { error: 'Please log in again.' };
  const company = text(f, 'company', 120);
  const role = text(f, 'role', 160);
  if (!company || !role) return { error: 'Add the company and the role.' };
  let apply_url = text(f, 'apply_url', 400);
  if (apply_url && !/^https?:\/\//i.test(apply_url) && !apply_url.includes('@')) apply_url = `https://${apply_url}`;
  if (apply_url && apply_url.includes('@') && !apply_url.startsWith('mailto:') && !/^https?:/i.test(apply_url)) apply_url = `mailto:${apply_url}`;
  const { error } = await supabase.from('jobs').insert({
    company,
    role,
    location: text(f, 'location', 120),
    job_type: text(f, 'job_type', 40),
    apply_url,
    description: text(f, 'description', 800),
  });
  if (error) return { error: 'Couldn’t post the job. Try again.' };
  revalidatePath('/members/jobs');
  return { ok: true, message: `${role} at ${company} is posted.` };
}

/** Board only: add many alumni at once from a spreadsheet saved as CSV. */
export async function importAlumni(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await memberClient();
  if (!supabase) return { error: 'Please log in again.' };
  const user = await getUser();
  const { data: board } = await supabase.from('board_members').select('email').ilike('email', user?.email ?? '').maybeSingle();
  if (!board) return { error: 'Only board members can upload a spreadsheet.' };

  const file = f.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a CSV file.' };
  if (file.size > 900_000) return { error: 'That file is too big. Split it into smaller files.' };

  const rows = parseCSV(await file.text());
  if (rows.length < 2) return { error: 'The file is empty.' };

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const idx = {
    full_name: col('fullname', 'name'),
    class_year: col('classyear', 'year', 'class', 'graduationyear'),
    major: col('major'),
    role: col('role', 'title', 'currentrole', 'position'),
    company: col('company', 'employer', 'organization'),
    industry: col('industry'),
    city: col('city', 'location'),
    linkedin_url: col('linkedinurl', 'linkedin'),
    email: col('email', 'emailaddress'),
  };
  if (idx.full_name < 0) return { error: 'The first row needs a “full_name” (or “Name”) column. Use the template.' };

  const get = (r: string[], i: number, max = 200) => (i >= 0 ? (r[i] ?? '').trim().slice(0, max) || null : null);
  const records = rows.slice(1)
    .filter((r) => get(r, idx.full_name))
    .slice(0, 1000)
    .map((r) => {
      const y = Number(get(r, idx.class_year, 4));
      let li = get(r, idx.linkedin_url, 300);
      if (li && !/^https?:\/\//i.test(li)) li = `https://${li}`;
      return {
        full_name: get(r, idx.full_name, 120)!,
        class_year: Number.isInteger(y) && y > 1950 && y < 2100 ? y : null,
        major: get(r, idx.major, 120),
        role: get(r, idx.role, 120),
        company: get(r, idx.company, 120),
        industry: get(r, idx.industry, 80),
        city: get(r, idx.city, 120),
        linkedin_url: li,
        email: get(r, idx.email),
      };
    });
  if (!records.length) return { error: 'No rows with a name were found.' };

  const { error } = await supabase.from('alumni').insert(records);
  if (error) return { error: 'Couldn’t import the file. Check it matches the template and try again.' };
  revalidatePath('/members/alumni');
  return { ok: true, message: `Added ${records.length} ${records.length === 1 ? 'person' : 'people'} to the directory.` };
}

/** Only accept photo paths this site uploaded, in the expected folder. */
function storedPath(f: FormData, key: string, folder: string) {
  const p = String(f.get(key) ?? '').trim();
  return p && p.startsWith(folder) && !p.includes('..') && p.length < 200 ? p : null;
}

/** Small CSV reader (handles quotes and commas inside quotes). */
function parseCSV(input: string): string[][] {
  const s = input.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
