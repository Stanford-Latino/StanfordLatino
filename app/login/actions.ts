'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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
    return { error: 'Login isn’t available right now. Please try again later.' };
  }

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || h.get('origin') || `https://${h.get('host')}`;
  const safeNext = safePath(next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(safeNext)}` },
  });

  if (error) {
    const wait = error.message.match(/after (\d+) seconds?/i);
    if (wait) return { error: `Please wait ${wait[1]} seconds before sending another link.`, sentTo: formData.get('resend') ? email : undefined };
    const limited = error.status === 429 || /rate|limit/i.test(error.message);
    return {
      error: limited
        ? 'Too many login emails were sent in the last hour. Please try again later.'
        : 'We couldn’t send the email. Try again in a minute.',
      sentTo: formData.get('resend') ? email : undefined,
    };
  }
  return { sentTo: email };
}

/** Log in with the code from the email (works even if the link opens in another browser). */
export async function verifyLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const token = String(formData.get('code') ?? '').replace(/\s/g, '');
  const next = safePath(String(formData.get('next') ?? '/'));
  if (!isAllowedEmail(email)) return { error: 'Please use your @stanford.edu email.', sentTo: email };
  if (!/^\d{6,10}$/.test(token)) return { error: 'Enter the code from the email.', sentTo: email };

  const supabase = await createClient();
  let { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) ({ error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' }));
  if (error) return { error: 'That code didn’t work or expired. Check it, or send a new code.', sentTo: email };
  redirect(next);
}
