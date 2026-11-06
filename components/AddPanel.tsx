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
};

/** A "+ Add …" button that opens a form right on the page. */
export default function AddPanel({ buttonLabel, title, submitLabel, action, children }: Props) {
  const [open, setOpen] = useState(false);
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
      <div className="add-bar">
        <button className="btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Plus /> {buttonLabel}
        </button>
        {state.ok && state.message && !open && <p role="status" className="add-ok">{state.message}</p>}
      </div>
      {open && (
        <form ref={formRef} action={formAction} className="add-form">
          <h2>{title}</h2>
          <div className="add-fields">{children}</div>
          {state.error && <p role="alert" className="error">{state.error}</p>}
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
