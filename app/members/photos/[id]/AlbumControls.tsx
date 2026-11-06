'use client';

import { useActionState, useEffect, useState } from 'react';
import { deleteAlbum, renameAlbum } from '../../actions';
import type { FormState } from '../../actions';

export default function AlbumControls({ id, title, canDelete }: { id: string; title: string; canDelete: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(renameAlbum, {});
  useEffect(() => { if (state.ok) setEditing(false); }, [state]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
      {editing ? (
        <form action={action} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <input type="hidden" name="id" value={id} />
          <input name="title" defaultValue={title} className="input" required maxLength={120} aria-label="Album name" style={{ minWidth: 260 }} autoFocus />
          <button className="btn" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
          <button type="button" className="text-btn" onClick={() => setEditing(false)}>Cancel</button>
          {state.error && <p role="alert" className="error">{state.error}</p>}
        </form>
      ) : (
        <button type="button" className="text-btn" onClick={() => setEditing(true)}>Rename album</button>
      )}
      {canDelete && !editing && (
        confirm ? (
          <form action={deleteAlbum} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input type="hidden" name="id" value={id} />
            <span style={{ fontSize: 15 }}>Delete this album and all its photos?</span>
            <button className="btn">Delete</button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>Cancel</button>
          </form>
        ) : (
          <button type="button" className="text-btn" onClick={() => setConfirm(true)}>Delete album</button>
        )
      )}
    </div>
  );
}
