'use server';

import { headers } from 'next/headers';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { isAllowedEmail, safePath } from '@/lib/auth';

export type LoginState = { error?: string; sentTo?: string };

export async function sendLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = String(formData.get('next') ?? '/');

  if (!isAllowedEmail(email)) {
    return { error: 'Please use your @stanford.edu email.' };
  }
  if (!supabaseConfigured()) {
    return { error: 'Login isn’t set up yet — add the Supabase keys (see README).' };
  }

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || h.get('origin') || `https://${h.get('host')}`;
  const safeNext = safePath(next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  });

  if (error) return { error: 'We couldn’t send the email. Try again in a minute.' };
  return { sentTo: email };
}
