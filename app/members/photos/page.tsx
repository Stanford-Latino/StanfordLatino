import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Placeholder from '@/components/Placeholder';
import AddPanel, { Field } from '@/components/AddPanel';
import { createAlbum } from '../actions';

export const metadata: Metadata = { title: 'Photos · Stanford Latino' };

type AlbumRow = { id: string; title: string; event_date: string | null; photos: { storage_path: string }[] };

export default async function PhotosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('albums')
    .select('id, title, event_date, photos(storage_path)')
    .order('event_date', { ascending: false });
  const albums = (data ?? []) as AlbumRow[];

  const coverPaths = albums.map((a) => a.photos[0]?.storage_path).filter(Boolean) as string[];
  const { data: signed } = coverPaths.length
    ? await supabase.storage.from('photos').createSignedUrls(coverPaths, 60 * 60)
    : { data: [] as { path: string | null; signedUrl: string }[] };
  const coverUrl = new Map<string | null, string | null>((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <div className="page" style={{ gap: 40 }}>
      <div className="page-head">
        <h1 className="page-title">Photos</h1>
        <p className="lede">An album for every event. Open one to see everyone’s photos, or add your own.</p>
      </div>
      <AddPanel buttonLabel="New album" title="New album" submitLabel="Create album" action={createAlbum}>
        <Field label="Album name" name="title" required placeholder="e.g. Fall Welcome Social" />
        <Field label="Event date" name="event_date" type="date" />
      </AddPanel>
      {albums.length === 0 ? (
        <p className="notice">No albums yet. Create the first one with the button above.</p>
      ) : (
        <div className="albums">
          {albums.map((a) => {
            const cover = a.photos[0] ? coverUrl.get(a.photos[0].storage_path) ?? undefined : undefined;
            return (
              <Link key={a.id} href={`/members/photos/${a.id}`} className="album-card">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="cover" src={cover} alt="" />
                ) : (
                  <Placeholder />
                )}
                <b>{a.title}</b>
                <span style={{ fontSize: 14 }}>
                  {[formatDate(a.event_date), `${a.photos.length} ${a.photos.length === 1 ? 'photo' : 'photos'}`].filter(Boolean).join(' · ')}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
