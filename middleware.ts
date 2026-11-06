import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedEmail } from '@/lib/auth';

// Keeps the login session fresh and keeps /members/* behind a Stanford login.
export async function middleware(request: NextRequest) {
  // Login links that landed on the wrong path (e.g. "/&token_hash=...") get sent to the login step.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname !== '/auth/confirm') {
    const raw = decodeURIComponent(pathname);
    let params: URLSearchParams | null = null;
    let next = searchParams.get('next') || '/';
    if (searchParams.get('token_hash')) {
      params = searchParams;
      if (pathname !== '/') next = pathname;
    } else if (raw.includes('token_hash=')) {
      const i = raw.indexOf('&');
      params = new URLSearchParams(raw.slice(i + 1));
      const before = raw.slice(0, i);
      if (before && before !== '/') next = before;
    }
    if (params?.get('token_hash')) {
      const to = new URL('/auth/confirm', request.url);
      to.search = '';
      to.searchParams.set('token_hash', params.get('token_hash')!);
      to.searchParams.set('type', params.get('type') || 'email');
      to.searchParams.set('next', next);
      return NextResponse.redirect(to);
    }
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isMembers = request.nextUrl.pathname.startsWith('/members');

  if (!url || !key) {
    if (isMembers) return NextResponse.redirect(new URL('/login?error=setup', request.url));
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (isMembers && (!user || !isAllowedEmail(user.email))) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    if (user) login.searchParams.set('error', 'domain');
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|icon|apple-icon|manifest).*)'],
};
