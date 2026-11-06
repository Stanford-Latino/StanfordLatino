'use client';

import { useActionState } from 'react';
import { sendLoginLink, type LoginState } from './actions';

export default function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, { error: initialError });

  if (state.sentTo) {
    return (
      <div className="login-card">
        <h1>Check your email</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6 }}>
          We sent a login link to <b>{state.sentTo}</b>. Open it on this device and you’ll be back on the site with the Alumni Directory, Events, Jobs and Photos unlocked.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="login-card">
      <h1>Login</h1>
      <p style={{ fontSize: 16, lineHeight: 1.5 }}>
        Use your student/alumni login. We’ll email you a link — no password needed.
      </p>
      <label htmlFor="email" className="label">Stanford email</label>
      <input id="email" name="email" type="email" className="input" placeholder="you@stanford.edu" autoComplete="email" required />
      <input type="hidden" name="next" value={next} />
      {state.error && <p role="alert" className="error">{state.error}</p>}
      <button className="btn" disabled={pending} style={{ marginTop: 8 }}>
        {pending ? 'Sending…' : 'Email me a login link'}
      </button>
    </form>
  );
}
