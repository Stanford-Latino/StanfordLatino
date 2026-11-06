'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { shrinkImage } from '@/lib/shrinkImage';

const MAX_MB = 15;

/** Optional photo picker for a form. Uploads right away and hands the form a stored path. */
export default function ImageField({ label, name, folder }: { label: string; name: string; folder: string }) {
  const [path, setPath] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const id = `img-${name}`;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const file = await shrinkImage(picked);
    if (!file.type.startsWith('image/') || picked.size > MAX_MB * 1024 * 1024) {
      setStatus(`Please choose an image under ${MAX_MB} MB.`);
      return;
    }
    setStatus('Uploading…');
    setPreview(URL.createObjectURL(file));
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const p = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await createClient().storage.from('photos').upload(p, file, { contentType: file.type });
    if (error) {
      setStatus('Upload failed. Try again.');
      setPath('');
      return;
    }
    setPath(p);
    setStatus('Photo added.');
  }

  return (
    <div className="field">
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type="file" accept="image/*" onChange={onChange} className="input" />
      <input type="hidden" name={name} value={path} />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" style={{ width: 120, height: 120, objectFit: 'cover', marginTop: 6 }} />
      )}
      {status && <p style={{ fontSize: 14 }}>{status}</p>}
    </div>
  );
}
