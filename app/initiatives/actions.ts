'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUser } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { isPresident } from '@/lib/board';
import { initiatives } from '@/content/site';
import type { FormState } from '@/app/members/actions';
import { notifyPresidents } from '@/lib/notify';

const text = (f: FormData, k: string, max = 600) => String(f.get(k) ?? '').trim().slice(0, max) || null;

async function presidentClient() {
  const user = await getUser();
  if (!user || !isAllowedEmail(user.email) || !(await isPresident())) return null;
  return createClient();
}

function validSlug(f: FormData) {
  const slug = String(f.get('slug') ?? '');
  return initiatives.some((i) => i.slug === slug) ? slug : null;
}

function sitePath(f: FormData, key: string) {
  const p = String(f.get(key) ?? '').trim();
  return p && p.startsWith('initiatives/') && !p.includes('..') && p.length < 200 ? p : null;
}

function refresh(slug: string) {
  revalidatePath(`/initiatives/${slug}`);
  revalidatePath('/');
}
const titleOf = (slug: string) => initiatives.find((i) => i.slug === slug)?.title ?? slug;

/** Add a past event (no id) or update one (with id). */
export async function saveInitiativeEvent(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await presidentClient();
  const slug = validSlug(f);
  if (!supabase || !slug) return { error: 'Only presidents can edit initiatives.' };
  const name = text(f, 'name', 160);
  if (!name) return { error: 'Add the event name.' };
  const row: Record<string, unknown> = { name, date_label: text(f, 'date_label', 60), description: text(f, 'description', 800) };
  const photo = sitePath(f, 'photo_path');
  if (photo) row.photo_path = photo;
  if (f.get('remove_photo') === '1') row.photo_path = null;
  const id = String(f.get('id') ?? '');
  const { error } = id
    ? await supabase.from('initiative_events').update(row).eq('id', id)
    : await supabase.from('initiative_events').insert({ ...row, initiative: slug, position: -Math.floor(Date.now() / 1000) });
  if (error) return { error: 'Couldn’t save. Try again.' };
  refresh(slug);
  await notifyPresidents(`${titleOf(slug)}: past event ${id ? 'edited' : 'added'} (${name})`, `/initiatives/${slug}`);
  return { ok: true, message: id ? 'Saved.' : `“${name}” added.` };
}

export async function deleteInitiativeEvent(f: FormData) {
  const supabase = await presidentClient();
  const slug = validSlug(f);
  const id = String(f.get('id') ?? '');
  if (!supabase || !slug || !id) return;
  await supabase.from('initiative_events').delete().eq('id', id);
  refresh(slug);
  await notifyPresidents(`${titleOf(slug)}: a past event was deleted`, `/initiatives/${slug}`);
}

/** Cover photo and intro text. */
export async function saveInitiativeSettings(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await presidentClient();
  const slug = validSlug(f);
  if (!supabase || !slug) return { error: 'Only presidents can edit initiatives.' };
  const row: Record<string, unknown> = { slug, body: text(f, 'body', 1500), updated_at: new Date().toISOString() };
  const photo = sitePath(f, 'photo_path');
  if (photo) row.photo_path = photo;
  const { error } = await supabase.from('initiative_settings').upsert(row);
  if (error) return { error: 'Couldn’t save. Try again.' };
  refresh(slug);
  await notifyPresidents(`${titleOf(slug)}: photo or text updated`, `/initiatives/${slug}`);
  return { ok: true, message: 'Saved.' };
}
