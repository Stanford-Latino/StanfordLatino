'use client';

import { useState } from 'react';
import { confirmLogin } from './actions';

// A real tap is required: Stanford's email security opens links (and runs the page)
// before the person does, which would use up a one-time link.
export default function Confirm({ tokenHash, type, next }: { tokenHash: string; type: string; next: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="login-card">
      <h1>Welcome back</h1>
      <p style={{ fontSize: 17, lineHeight: 1.6 }}>Tap below to finish logging in.</p>
      <button
        className="btn"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          confirmLogin(tokenHash, type, next).then((to) => window.location.replace(to));
        }}
      >
        {busy ? 'Logging you in…' : 'Log in'}
      </button>
    </div>
  );
}
