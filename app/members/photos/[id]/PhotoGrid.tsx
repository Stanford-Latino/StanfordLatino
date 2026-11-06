'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deletePhoto } from '../../actions';

type Photo = { id: string; url: string };

/** Album grid: click a photo to open it large; click anywhere to close. Presidents can delete. */
export default function PhotoGrid({ photos, albumId, title, canDelete }: { photos: Photo[]; albumId: string; title: string; canDelete: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, photos.length]);

  async function remove(id: string) {
    setBusy(id);
    await deletePhoto(id, albumId);
    setBusy(null);
    setConfirmId(null);
    router.refresh();
  }

  return (
    <>
      <div className="photo-grid">
        {photos.map((p, i) => (
          <div key={p.id} className="photo-tile">
            <button type="button" className="photo-open" onClick={() => setOpen(i)} aria-label="Open photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="square" src={p.url} alt={`${title} photo`} loading="lazy" />
            </button>
            {canDelete && (
              confirmId === p.id ? (
                <div className="photo-confirm">
                  <button type="button" onClick={() => remove(p.id)} disabled={busy === p.id}>{busy === p.id ? 'Deleting…' : 'Delete'}</button>
                  <button type="button" onClick={() => setConfirmId(null)}>Cancel</button>
                </div>
              ) : (
                <button type="button" className="photo-delete" onClick={() => setConfirmId(p.id)}>Delete</button>
              )
            )}
          </div>
        ))}
      </div>

      {open !== null && photos[open] && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label="Photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[open].url} alt={`${title} photo`} />
        </div>
      )}
    </>
  );
}
