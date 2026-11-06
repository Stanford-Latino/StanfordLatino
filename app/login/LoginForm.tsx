'use client';

import { useActionState, useEffect, useState } from 'react';
import { sendLoginLink, verifyLoginCode, type LoginState } from './actions';

export default function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [sendState, sendAction, sending] = useActionState<LoginState, FormData>(sendLoginLink, { error: initialError });
  const [codeState, codeAction, checking] = useActionState<LoginState, FormData>(verifyLoginCode, {});
  const [restart, setRestart] = useState(false);
  useEffect(() => setRestart(false), [sendState]);

  const sentTo = !restart && sendState.sentTo;

  if (sentTo) {
    return (
      <form action={codeAction} className="login-card">
        <h1>Check your email</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6 }}>
          We sent a login email to <b>{sentTo}</b>. Type the code from the email here, or tap the link in it.
        </p>
        <label htmlFor="code" className="label">Login code</label>
        <input
          id="code" name="code" className="input" inputMode="numeric" autoComplete="one-time-code"
          placeholder="123456" maxLength={10} required style={{ fontSize: 22, letterSpacing: '0.2em' }}
        />
        <input type="hidden" name="email" value={sentTo} />
        <input type="hidden" name="next" value={next} />
        {codeState.error && <p role="alert" className="error">{codeState.error}</p>}
        <button className="btn" disabled={checking} style={{ marginTop: 8 }}>{checking ? 'Checking…' : 'Log in'}</button>
        <button type="button" onClick={() => setRestart(true)} style={{ background: 'none', border: 0, textDecoration: 'underline', cursor: 'pointer', minHeight: 44, fontSize: 15 }}>
          Use a different email or send a new one
        </button>
      </form>
    );
  }

  return (
    <form action={sendAction} className="login-card">
      <h1>Login</h1>
      <p style={{ fontSize: 16, lineHeight: 1.5 }}>Use your Stanford student/alumni email.</p>
      <label htmlFor="email" className="label">Stanford email</label>
      <input id="email" name="email" type="email" className="input" placeholder="you@stanford.edu" autoComplete="email" autoCapitalize="none" required />
      <input type="hidden" name="next" value={next} />
      {sendState.error && <p role="alert" className="error">{sendState.error}</p>}
      <button className="btn" disabled={sending} style={{ marginTop: 8 }}>{sending ? 'Sending…' : 'Email me a login code'}</button>
    </form>
  );
}
