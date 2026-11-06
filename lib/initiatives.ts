import { initiatives, type Initiative } from '@/content/site';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

export type InitiativeEvent = { id?: string; name: string; date: string; description: string; photo?: string | null; photoPath?: string | null };

export function sitePhotoUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site/${path}`;
}

/** Initiative content: editable parts come from the database, the rest from content/site.ts. */
export async function loadInitiative(slug: string): Promise<(Initiative & { liveEvents: InitiativeEvent[] }) | null> {
  const base = initiatives.find((i) => i.slug === slug);
  if (!base) return null;
  const fallback = { ...base, liveEvents: base.events.map((e) => ({ name: e.name, date: e.date, description: e.description, photo: e.photo })) };
  if (!supabaseConfigured()) return fallback;
  const supabase = await createClient();
  const [{ data: settings }, { data: events, error }] = await Promise.all([
    supabase.from('initiative_settings').select('photo_path, body').eq('slug', slug).maybeSingle(),
    supabase.from('initiative_events').select('id, name, date_label, description, photo_path').eq('initiative', slug)
      .order('position').order('created_at'),
  ]);
  if (error) return fallback;
  return {
    ...base,
    photo: sitePhotoUrl(settings?.photo_path) ?? base.photo,
    body: settings?.body || base.body,
    liveEvents: (events ?? []).map((e) => ({
      id: e.id, name: e.name, date: e.date_label ?? '', description: e.description ?? '',
      photo: sitePhotoUrl(e.photo_path), photoPath: e.photo_path,
    })),
  };
}

/** Cover photos for the home page cards. */
export async function loadInitiativeCovers(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!supabaseConfigured()) return map;
  const supabase = await createClient();
  const { data } = await supabase.from('initiative_settings').select('slug, photo_path');
  (data ?? []).forEach((r) => { const u = sitePhotoUrl(r.photo_path); if (u) map.set(r.slug, u); });
  return map;
}
