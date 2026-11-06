import type { Metadata } from 'next';
import LoginForm from './LoginForm';
import { safePath } from '@/lib/auth';

export const metadata: Metadata = { title: 'Login · Stanford Latino' };

const ERRORS: Record<string, string> = {
  domain: 'That account isn’t a @stanford.edu email. Log in with your Stanford email.',
  link: 'That login link expired or was already used. Send a new one.',
  setup: 'Login isn’t set up yet — add the Supabase keys (see README).',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <div className="page" style={{ paddingTop: 88 }}>
      <LoginForm next={safePath(next)} initialError={error ? ERRORS[error] : undefined} />
    </div>
  );
}
