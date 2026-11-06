'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { shrinkImage } from '@/lib/shrinkImage';
import { photosAdded } from '../../actions';

const MAX_MB = 15;

/** Add photos to an album: drag in as many as you like (anywhere on the page) or click to choose. */
export default function Uploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);

  async function upload(list: File[]) {
    const files = list.filter((f) => f.type.startsWith('image/'));
    if (!files.length || busy) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    let done = 0;
    let failed = 0;
    let next = 0;
    const tick = () => setProgress(`Uploading ${done + failed} of ${files.length}…`);
    tick();
    async function worker() {
      while (next < files.length) {
        const original = files[next++];
        try {
          if (original.size > MAX_MB * 1024 * 1024) throw new Error('too big');
          const file = await shrinkImage(original);
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
          const path = `${albumId}/${crypto.randomUUID()}.${ext}`;
          const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type });
          if (up.error) throw up.error;
          const ins = await supabase.from('photos').insert({ album_id: albumId, storage_path: path });
          if (ins.error) { await supabase.storage.from('photos').remove([path]); throw ins.error; }
          done++;
        } catch {
          failed++;
        }
        tick();
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, files.length) }, worker));
    setBusy(false);
    setProgress(null);
    if (done) photosAdded(albumId, done).catch(() => {});
    setMsg(failed ? `Added ${done}. ${failed} couldn’t be added (images under ${MAX_MB} MB only).` : `Added ${done} ${done === 1 ? 'photo' : 'photos'}.`);
    router.refresh();
  }

  // Drop photos anywhere on the album page.
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
    const enter = (e: DragEvent) => { if (!hasFiles(e)) return; depth.current++; setDragging(true); };
    const leave = (e: DragEvent) => { if (!hasFiles(e)) return; depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); };
    const over = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault(); };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      upload(Array.from(e.dataTransfer?.files ?? []));
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragleave', leave);
    window.addEventListener('dragover', over);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('dragover', over);
      window.removeEventListener('drop', drop);
    };
  });

  return (
    <>
      <div
        className="dropzone"
        role="button"
        tabIndex={0}
        aria-disabled={busy}
        onClick={() => !busy && input.current?.click()}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !busy) { e.preventDefault(); input.current?.click(); } }}
      >
        <b>{busy ? progress : 'Add photos'}</b>
        <span>{busy ? 'Keep this page open until it finishes.' : 'Drag photos anywhere on this page, or click to choose. You can add many at once.'}</span>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      </div>
      {msg && <p role="status" style={{ fontSize: 15 }}>{msg}</p>}
      {dragging && <div className="drop-overlay" aria-hidden><span>Drop photos to add them to this album</span></div>}
    </>
  );
}
