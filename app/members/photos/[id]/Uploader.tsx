'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { shrinkImage } from '@/lib/shrinkImage';
import { Plus } from '@/components/Icons';

const MAX_MB = 15;

export default function Uploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    let done = 0;
    let failed = 0;
    for (const original of files) {
      if (!original.type.startsWith('image/') || original.size > MAX_MB * 1024 * 1024) { failed++; continue; }
      const file = await shrinkImage(original);
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${albumId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type });
      if (up.error) { failed++; continue; }
      const ins = await supabase.from('photos').insert({ album_id: albumId, storage_path: path });
      if (ins.error) { failed++; await supabase.storage.from('photos').remove([path]); continue; }
      done++;
    }
    setBusy(false);
    setMsg(failed ? `Added ${done}. ${failed} couldn’t be added (images under ${MAX_MB} MB only).` : `Added ${done} ${done === 1 ? 'photo' : 'photos'}.`);
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <label className="btn upload" aria-disabled={busy}>
        <Plus /> {busy ? 'Uploading…' : 'Add photos'}
        <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} />
      </label>
      {msg && <p role="status" style={{ fontSize: 14 }}>{msg}</p>}
    </div>
  );
}
