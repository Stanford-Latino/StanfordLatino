'use client';

import { useEffect, useState } from 'react';

export type CalEvent = {
  id: string;
  title: string;
  category: string;
  starts_at: string;
  location: string | null;
  description: string | null;
  flyer_url: string | null;
};

const CATS: Record<string, { label: string; dot: string; bg: string }> = {
  social: { label: 'Social', dot: '#8C1515', bg: '#F6E5E5' },
  career: { label: 'Career', dot: '#1F5FBF', bg: '#E4EDFA' },
  speaker: { label: 'Speaker series', dot: '#C46A00', bg: '#FBEBD9' },
  philanthropy: { label: 'Philanthropy', dot: '#2E7D4F', bg: '#E2F1E8' },
};
const cat = (c: string) => CATS[c] ?? CATS.social;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TZ = 'America/Los_Angeles';

function partsInTZ(iso: string) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
  const get = (t: string) => Number(f.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month') - 1, d: get('day') };
}

export default function EventsCalendar({ events }: { events: CalEvent[] }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selId, setSelId] = useState<string | null>(null);

  const first = new Date(ym.y, ym.m, 1).getDay();
  const dim = new Date(ym.y, ym.m + 1, 0).getDate();
  const total = Math.ceil((first + dim) / 7) * 7;
  const inMonth = events.filter((e) => {
    const p = partsInTZ(e.starts_at);
    return p.y === ym.y && p.m === ym.m;
  });
  const sel = events.find((e) => e.id === selId) ?? null;
  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
    setSelId(null);
  };
  useEffect(() => {
    if (!selId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selId]);
  const time = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <div className="cal-bar">
        <div className="cal-nav">
          <button aria-label="Previous month" onClick={() => shift(-1)}>‹</button>
          <h2>{MONTHS[ym.m]} {ym.y}</h2>
          <button aria-label="Next month" onClick={() => shift(1)}>›</button>
        </div>
        <div className="legend">
          {Object.values(CATS).map((c) => (
            <span key={c.label} style={{ background: c.bg }}><i className="dot" style={{ background: c.dot }} />{c.label}</span>
          ))}
        </div>
      </div>

      <div className="cal-scroll">
        <div className="cal">
          <div className="cal-head">{DAYS.map((d) => <div key={d}>{d}</div>)}</div>
          <div className="cal-grid">
            {Array.from({ length: total }, (_, i) => {
              const day = i - first + 1;
              const valid = day >= 1 && day <= dim;
              const isToday = valid && ym.y === now.getFullYear() && ym.m === now.getMonth() && day === now.getDate();
              const todays = valid ? inMonth.filter((e) => partsInTZ(e.starts_at).d === day) : [];
              return (
                <div key={i} className={`cal-cell${valid ? '' : ' out'}`}>
                  {valid && <span className={`cal-num${isToday ? ' today' : ''}`}>{day}</span>}
                  {todays.map((e) => (
                    <button
                      key={e.id}
                      className="cal-event"
                      onClick={() => setSelId(e.id)}
                      style={{ background: cat(e.category).bg, outline: selId === e.id ? `2px solid ${cat(e.category).dot}` : 'none' }}
                    >
                      <i className="dot" style={{ width: 8, height: 8, background: cat(e.category).dot }} />
                      {e.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="event-list">
        {inMonth.length === 0 && events.length > 0 && <li className="notice">Nothing this month.</li>}
        {[...inMonth]
          .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
          .map((e) => (
            <li key={e.id}>
              <button onClick={() => setSelId(e.id)} style={{ borderLeftColor: cat(e.category).dot }}>
                <span className="when">{time(e.starts_at)}</span>
                <span className="what">{e.title}</span>
                <span className="cat">{cat(e.category).label}{e.location ? ` · ${e.location}` : ''}</span>
              </button>
            </li>
          ))}
      </ul>

      {sel && (
        <div className="event-overlay" onClick={() => setSelId(null)}>
          <div
            className="event-pop"
            role="dialog"
            aria-modal="true"
            aria-label={sel.title}
            onClick={(e) => e.stopPropagation()}
            style={{ borderTop: `6px solid ${cat(sel.category).dot}` }}
          >
            <button className="event-pop-close" aria-label="Close" onClick={() => setSelId(null)}>×</button>
            <p className="event-pop-meta">
              <i className="dot" style={{ background: cat(sel.category).dot }} />
              {cat(sel.category).label}
            </p>
            <h3>{sel.title}</h3>
            <p className="event-pop-when">{time(sel.starts_at)}</p>
            {sel.location && <p className="event-pop-where">{sel.location}</p>}
            {sel.flyer_url && (
              <a href={sel.flyer_url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sel.flyer_url} alt={`${sel.title} flyer`} />
              </a>
            )}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p className="notice">No events yet. Add one with the button above.</p>
      )}
    </>
  );
}
