import { createClient, getUser } from '@/lib/supabase/server';

/** True if the logged-in person's email is in the board_members table. */
export async function isBoardMember() {
  const user = await getUser();
  if (!user?.email) return false;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('is_board');
  if (!error) return data === true;
  // Fallback if the database function isn't reachable: check the board list directly.
  const { data: row } = await supabase.from('board_members').select('email').ilike('email', user.email).maybeSingle();
  return Boolean(row);
}

/** Photos are stored privately; this turns stored paths into temporary links. */
export async function signPaths(paths: (string | null | undefined)[]) {
  const toSign = Array.from(new Set(paths.filter((p): p is string => Boolean(p) && !/^https?:\/\//.test(p as string))));
  const map = new Map<string, string>();
  if (!toSign.length) return map;
  const supabase = await createClient();
  const { data } = await supabase.storage.from('photos').createSignedUrls(toSign, 60 * 60);
  (data ?? []).forEach((s) => { if (s.path && s.signedUrl) map.set(s.path, s.signedUrl); });
  return map;
}

export function resolvePhoto(path: string | null | undefined, signed: Map<string, string>) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return signed.get(path) ?? null;
}
