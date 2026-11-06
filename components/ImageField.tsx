'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { shrinkImage } from '@/lib/shrinkImage';

const MAX_MB = 15;

/** Photo picker for a form: drag a photo in or click to choose. Uploads right away and hands the form a stored path. */
export default function ImageField({ label, name, folder, bucket = 'photos', initialPreview }: { label: string; name: string; folder: string; bucket?: string; initialPreview?: string | null }) {
  const [path, setPath] = useState('');
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const round = folder === 'alumni';

  async function handle(picked: File | undefined) {
    if (!picked) return;
    if (!picked.type.startsWith('image/') || picked.size > MAX_MB * 1024 * 1024) {
      setStatus(`Please use an image under ${MAX_MB} MB.`);
      return;
    }
    const file = await shrinkImage(picked);
    setStatus('Uploading…');
    setPreview(URL.createObjectURL(file));
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const p = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await createClient().storage.from(bucket).upload(p, file, { contentType: file.type });
    if (error) {
      setStatus('Upload failed. Try again.');
      setPath('');
      return;
    }
    setPath(p);
    setStatus(null);
  }

  return (
    <div className="field">
      <span className="label">{label}</span>
      <div
        className={`dropzone small${over ? ' over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files?.[0]); }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: round ? '50%' : 0, flex: 'none' }} />
        ) : null}
        <span>{status ?? (preview ? 'Drag a new photo here or click to change' : 'Drag a photo here or click to choose')}</span>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      <input type="hidden" name={name} value={path} />
    </div>
  );
}
