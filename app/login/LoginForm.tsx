'use client';

import { useActionState, useEffect, useState } from 'react';
import { sendLoginLink, verifyLoginCode, type LoginState } from './actions';

export default function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [sendState, sendAction, sending] = useActionState<LoginState, FormData>(sendLoginLink, { error: initialError });
  const [codeState, codeAction, checking] = useActionState<LoginState, FormData>(verifyLoginCode, {});
  const [restart, setRestart] = useState(false);
  useEffect(() => { setRestart(false); }, [sendState]);

  const sentTo = !restart && sendState.sentTo;

  if (sentTo) {
    return (
      <div className="login-card">
        <h1>Enter your code</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6 }}>
          We sent a login code to <b>{sentTo}</b>. Can’t find it? Check your spam or junk folder.
        </p>
        <form action={codeAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label htmlFor="code" className="label">Login code</label>
          <input id="code" name="code" className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={10} autoFocus required style={{ fontSize: 22, letterSpacing: 4 }} />
          <input type="hidden" name="email" value={sentTo} />
          <input type="hidden" name="next" value={next} />
          {codeState.error && <p role="alert" className="error">{codeState.error}</p>}
          <button className="btn" disabled={checking}>{checking ? 'Checking…' : 'Log in'}</button>
        </form>
        <form action={sendAction}>
          <input type="hidden" name="email" value={sentTo} />
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="resend" value="1" />
          {sendState.error && <p role="alert" className="error">{sendState.error}</p>}
          <button className="text-btn" disabled={sending}>{sending ? 'Sending…' : 'Send a new code'}</button>
        </form>
        <button type="button" className="text-btn" onClick={() => setRestart(true)}>Use a different email</button>
      </div>
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
