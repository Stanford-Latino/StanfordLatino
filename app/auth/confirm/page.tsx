import { redirect } from 'next/navigation';
import Confirm from './Confirm';
import { safePath } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token_hash?: string; type?: string; next?: string }> }) {
  const { token_hash, type, next } = await searchParams;
  if (!token_hash) redirect('/login?error=link');
  return (
    <div className="page" style={{ paddingTop: 88 }}>
      <Confirm tokenHash={token_hash} type={type ?? 'email'} next={safePath(next)} />
    </div>
  );
}
