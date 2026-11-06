import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail, safePath } from '@/lib/auth';

// The login email links here. We swap the one-time code for a session,
// then double-check the email is a Stanford one.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safePath(searchParams.get('next'));

  if (!code) return NextResponse.redirect(`${origin}/login?error=link`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=link`);

  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=domain`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
