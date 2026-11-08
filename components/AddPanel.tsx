'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { FormState } from '@/app/members/actions';
import { Plus } from './Icons';

type Props = {
  buttonLabel: string;
  title: string;
  submitLabel: string;
  action: (prev: FormState, f: FormData) => Promise<FormState>;
  children: React.ReactNode;
  /** 'banner' shows a maroon "Are you a …?" banner instead of a button. */
  variant?: 'button' | 'banner';
  bannerQuestion?: string;
  align?: 'center' | 'start';
};

/** A "+ Add …" button (or banner) that opens a form right on the page. */
export default function AddPanel({ buttonLabel, title, submitLabel, action, children, variant = 'button', bannerQuestion, align = 'center' }: Props) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <div className="add-panel">
      {variant === 'banner' ? (
        !hidden && (
          <div className="alum-banner">
            {bannerQuestion && <p>{bannerQuestion}</p>}
            <button className="banner-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{buttonLabel} →</button>
            <button className="banner-close" aria-label="Dismiss" onClick={() => { setHidden(true); setOpen(false); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        )
      ) : (
        <div className="add-bar" style={{ justifyContent: align === 'start' ? 'flex-start' : 'center' }}>
          <button className="btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <Plus /> {buttonLabel}
          </button>
        </div>
      )}
      {state.ok && state.message && !open && <p role="status" className="add-ok">{state.message}</p>}
      {open && (
        <form ref={formRef} action={formAction} className="add-form">
          <h2>{title}</h2>
          {state.error && <p role="alert" className="error form-top-error">{state.error}</p>}
          <div className="add-fields">{children}</div>
          <div className="add-actions">
            <button className="btn" disabled={pending}>{pending ? 'Saving…' : submitLabel}</button>
            <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function Field({ label, name, type = 'text', required, placeholder, wide, children }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; wide?: boolean; children?: React.ReactNode;
}) {
  const id = `f-${name}`;
  return (
    <div className={`field${wide ? ' wide' : ''}`}>
      <label htmlFor={id} className="label">{label}{required ? ' *' : ''}</label>
      {children ? (
        <select id={id} name={name} className="select" required={required}>{children}</select>
      ) : type === 'textarea' ? (
        <textarea id={id} name={name} className="input" rows={3} placeholder={placeholder} />
      ) : (
        <input id={id} name={name} type={type} className="input" required={required} placeholder={placeholder} />
      )}
    </div>
  );
}
