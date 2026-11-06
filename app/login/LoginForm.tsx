'use client';

import { useActionState, useEffect, useState } from 'react';
import { sendLoginLink, type LoginState } from './actions';

export default function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [sendState, sendAction, sending] = useActionState<LoginState, FormData>(sendLoginLink, { error: initialError });
  const [restart, setRestart] = useState(false);
  const [who, setWho] = useState<'board' | 'member' | null>(initialError ? 'member' : null);
  useEffect(() => { setRestart(false); }, [sendState]);

  const sentTo = !restart && sendState.sentTo;

  if (sentTo) {
    return (
      <div className="login-card">
        <h1>Check your email</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6 }}>
          We sent a login link to <b>{sentTo}</b>. Tap it to log in.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6 }}>Can’t find it? Check your spam or junk folder.</p>
        <form action={sendAction}>
          <input type="hidden" name="email" value={sentTo} />
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="resend" value="1" />
          {sendState.error && <p role="alert" className="error">{sendState.error}</p>}
          <button className="text-btn" disabled={sending}>{sending ? 'Sending…' : 'Send a new link'}</button>
        </form>
        <button type="button" className="text-btn" onClick={() => setRestart(true)}>Use a different email</button>
      </div>
    );
  }

  if (!who) {
    return (
      <div className="login-choice">
        <button type="button" onClick={() => setWho('board')}>Board Member</button>
        <hr />
        <button type="button" onClick={() => setWho('member')}>Student / Alumni</button>
      </div>
    );
  }

  return (
    <form action={sendAction} className="login-card">
      <h1>{who === 'board' ? 'Board login' : 'Login'}</h1>
      <p style={{ fontSize: 16, lineHeight: 1.5 }}>
        {who === 'board' ? 'Use the Stanford email the board added.' : 'Use your Stanford student/alumni email.'}
      </p>
      <label htmlFor="email" className="label">Stanford email</label>
      <input id="email" name="email" type="email" className="input" placeholder="you@stanford.edu" autoComplete="email" autoCapitalize="none" required />
      <input type="hidden" name="next" value={who === 'board' ? `/members?board=1` : next} />
      {sendState.error && <p role="alert" className="error">{sendState.error}</p>}
      <button className="btn" disabled={sending} style={{ marginTop: 8 }}>{sending ? 'Sending…' : 'Email me a login link'}</button>
      <button type="button" className="text-btn" onClick={() => setWho(null)}>← Back</button>
    </form>
  );
}
