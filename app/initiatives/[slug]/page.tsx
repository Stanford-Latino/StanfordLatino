import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initiatives } from '@/content/site';
import Placeholder from '@/components/Placeholder';
import { loadInitiative } from '@/lib/initiatives';
import { isPresident } from '@/lib/board';
import { EditIntro, PastEvents } from './Editors';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = initiatives.find((i) => i.slug === slug);
  return { title: it ? `${it.title} · Stanford Latino` : 'Stanford Latino' };
}

export default async function InitiativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [it, president] = await Promise.all([loadInitiative(slug), isPresident()]);
  if (!it) notFound();

  return (
    <div className="page" style={{ gap: 64 }}>
      <div className="split">
        <div className="media">
          {it.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cover" src={it.photo} alt="" />
          ) : (
            <Placeholder label={`[${it.title} photo]`} />
          )}
        </div>
        <div className="text">
          <p className="eyebrow">Our Initiatives</p>
          <h1>{it.title}</h1>
          <div className="rule" aria-hidden="true" />
          <p className="body-lg">{it.body}</p>
          {it.stats && (
            <div className="stats">
              {it.stats.map((s) => (
                <div key={s.label} className="stat">
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          )}
          {president && <EditIntro slug={it.slug} body={it.body} photo={it.photo} />}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 36, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <PastEvents slug={it.slug} events={it.liveEvents} president={president} />
      </div>
    </div>
  );
}
