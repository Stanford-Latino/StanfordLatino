import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Uploader from './Uploader';
import { isBoardMember } from '@/lib/board';

export const metadata: Metadata = { title: 'Album · Stanford Latino' };

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const board = await isBoardMember();

  const { data: album } = await supabase.from('albums').select('id, title, event_date').eq('id', id).maybeSingle();
  if (!album) notFound();

  const { data: photos } = await supabase
    .from('photos')
    .select('id, storage_path, created_at')
    .eq('album_id', id)
    .order('created_at', { ascending: false });

  const paths = (photos ?? []).map((p) => p.storage_path);
  const { data: signed } = paths.length
    ? await supabase.storage.from('photos').createSignedUrls(paths, 60 * 60)
    : { data: [] as { path: string | null; signedUrl: string }[] };

  const dateLabel = album.event_date
    ? new Date(album.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="page" style={{ gap: 28 }}>
      <div className="album-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link href="/members/photos" style={{ padding: '8px 0', fontSize: 15 }}>← All albums</Link>
          <h1>{album.title}</h1>
          <p style={{ fontSize: 16 }}>{[dateLabel, `${paths.length} ${paths.length === 1 ? 'photo' : 'photos'}`].filter(Boolean).join(' · ')}</p>
        </div>
        {board && <Uploader albumId={album.id} />}
      </div>
      {paths.length === 0 ? (
        <p className="notice">No photos yet.</p>
      ) : (
        <div className="photo-grid">
          {(signed ?? [])
            .map((s) => s.signedUrl)
            .filter((u): u is string => Boolean(u))
            .map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="square" src={url} alt={`${album.title} photo`} loading="lazy" />
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
