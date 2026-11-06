'use client';

import { useActionState, useEffect, useState } from 'react';
import Placeholder from '@/components/Placeholder';
import ImageField from '@/components/ImageField';
import type { FormState } from '@/app/members/actions';
import type { InitiativeEvent } from '@/lib/initiatives';
import { deleteInitiativeEvent, saveInitiativeEvent, saveInitiativeSettings } from '../actions';

function EventForm({ slug, event, onDone }: { slug: string; event?: InitiativeEvent; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveInitiativeEvent, {});
  useEffect(() => { if (state.ok) onDone(); }, [state, onDone]);
  return (
    <form action={action} className="edit-form">
      <input type="hidden" name="slug" value={slug} />
      {event?.id && <input type="hidden" name="id" value={event.id} />}
      <label className="label" htmlFor={`n-${event?.id ?? 'new'}`}>Event name *</label>
      <input id={`n-${event?.id ?? 'new'}`} name="name" className="input" defaultValue={event?.name ?? ''} required maxLength={160} />
      <label className="label" htmlFor={`d-${event?.id ?? 'new'}`}>Date</label>
      <input id={`d-${event?.id ?? 'new'}`} name="date_label" className="input" defaultValue={event?.date ?? ''} placeholder="e.g. October 12, 2026" />
      <label className="label" htmlFor={`t-${event?.id ?? 'new'}`}>Description</label>
      <textarea id={`t-${event?.id ?? 'new'}`} name="description" className="input" rows={3} defaultValue={event?.description ?? ''} />
      <ImageField label="Photo" name="photo_path" folder="initiatives" bucket="site" initialPreview={event?.photo} />
      {state.error && <p role="alert" className="error">{state.error}</p>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn" disabled={pending}>{pending ? 'Saving…' : event ? 'Save' : 'Add event'}</button>
        <button type="button" className="text-btn" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

function EventCard({ slug, ev, president }: { slug: string; ev: InitiativeEvent; president: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  if (editing) return <article className="event-card"><EventForm slug={slug} event={ev} onDone={() => setEditing(false)} /></article>;
  return (
    <article className="event-card">
      {ev.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cover" src={ev.photo} alt="" />
      ) : (
        <Placeholder label="[Event photo]" />
      )}
      <p className="event-date">{ev.date}</p>
      <h3>{ev.name}</h3>
      <p style={{ fontSize: 16, lineHeight: 1.6 }}>{ev.description}</p>
      {president && ev.id && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {confirm ? (
            <form action={deleteInitiativeEvent} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={ev.id} />
              <span style={{ fontSize: 15 }}>Delete this event?</span>
              <button className="btn">Delete</button>
              <button type="button" className="text-btn" onClick={() => setConfirm(false)}>Cancel</button>
            </form>
          ) : (
            <>
              <button type="button" className="text-btn" onClick={() => setEditing(true)}>Edit</button>
              <button type="button" className="text-btn" onClick={() => setConfirm(true)}>Delete</button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export function PastEvents({ slug, events, president }: { slug: string; events: InitiativeEvent[]; president: boolean }) {
  const [adding, setAdding] = useState(false);
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 38 }}>Past Events</h2>
        {president && !adding && <button className="btn" onClick={() => setAdding(true)}>+ Add event</button>}
      </div>
      {adding && (
        <div style={{ maxWidth: 520 }}>
          <EventForm slug={slug} onDone={() => setAdding(false)} />
        </div>
      )}
      <div className="events-grid">
        {events.map((ev, i) => <EventCard key={ev.id ?? i} slug={slug} ev={ev} president={president} />)}
      </div>
    </>
  );
}

export function EditIntro({ slug, body, photo }: { slug: string; body: string; photo?: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(saveInitiativeSettings, {});
  useEffect(() => { if (state.ok) setOpen(false); }, [state]);
  if (!open) return <button type="button" className="text-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen(true)}>Edit photo and text</button>;
  return (
    <form action={action} className="edit-form">
      <input type="hidden" name="slug" value={slug} />
      <label className="label" htmlFor="intro">Text</label>
      <textarea id="intro" name="body" className="input" rows={5} defaultValue={body} />
      <ImageField label="Main photo" name="photo_path" folder="initiatives" bucket="site" initialPreview={photo} />
      {state.error && <p role="alert" className="error">{state.error}</p>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
        <button type="button" className="text-btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
