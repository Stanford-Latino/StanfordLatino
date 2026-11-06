// Which email domains can log in. Add 'alumni.stanford.edu' (or similar) here later
// AND in supabase/schema.sql (function is_member) to open the members area to alumni.
export const ALLOWED_EMAIL_DOMAINS = ['stanford.edu'];

/** Only allow returning to a page on this site after login. */
export function safePath(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/login') || path.startsWith('/auth')) return '/';
  return path;
}

export function isAllowedEmail(email: string | null | undefined) {
  if (!email) return false;
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}
