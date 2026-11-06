import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Second lock on the members area (the middleware is the first).
export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login');
  if (!isAllowedEmail(user.email)) redirect('/login?error=domain');
  return <>{children}</>;
}
