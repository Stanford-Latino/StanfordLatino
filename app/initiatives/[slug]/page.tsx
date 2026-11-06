import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initiatives } from '@/content/site';
import Placeholder from '@/components/Placeholder';

export function generateStaticParams() {
  return initiatives.map((it) => ({ slug: it.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = initiatives.find((i) => i.slug === slug);
  return { title: it ? `${it.title} · Stanford Latino` : 'Stanford Latino' };
}

export default async function InitiativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = initiatives.find((i) => i.slug === slug);
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
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 36, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <h2 style={{ fontSize: 38 }}>Past Events</h2>
        <div className="events-grid">
          {it.events.map((ev, i) => (
            <article key={i} className="event-card">
              {ev.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="cover" src={ev.photo} alt="" />
              ) : (
                <Placeholder label="[Event photo]" />
              )}
              <p className="event-date">{ev.date}</p>
              <h3>{ev.name}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>{ev.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
