'use client';

import { useEffect, useRef } from 'react';
import { confirmLogin } from './actions';

export default function Confirm({ tokenHash, type, next }: { tokenHash: string; type: string; next: string }) {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    confirmLogin(tokenHash, type, next).then((to) => window.location.replace(to));
  }, [tokenHash, type, next]);
  return (
    <div className="login-card">
      <h1>Logging you in…</h1>
    </div>
  );
}
