'use server';

import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail, safePath } from '@/lib/auth';

// Logs the person in from the token in their email link. Runs only after the
// page loads in a real browser, so email security scanners can't use up the link.
export async function confirmLogin(tokenHash: string, type: string, next: string): Promise<string> {
  const supabase = await createClient();
  const tries: EmailOtpType[] = type === 'signup' ? ['signup', 'email'] : ['email', 'magiclink', 'signup'];
  let user = null;
  for (const t of tries) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: t });
    if (!error && data.user) { user = data.user; break; }
  }
  if (!user) return '/login?error=link';
  if (!isAllowedEmail(user.email)) {
    await supabase.auth.signOut();
    return '/login?error=domain';
  }
  return safePath(next);
}
