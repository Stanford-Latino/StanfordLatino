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
  });
  if (error) return { error: 'Couldn’t add you to the directory. Try again.' };
  revalidatePath('/members/alumni');
  return { ok: true, message: 'You’re in the directory.' };
}
