'use client';

import { useMemo, useState } from 'react';
import { Chevron, Pin, Search } from '@/components/Icons';

export type Alum = {
  id: string;
  full_name: string;
  class_year: number | null;
  major: string | null;
  role: string | null;
  company: string | null;
  industry: string | null;
  city: string | null;
  linkedin_url: string | null;
  email: string | null;
  photo_url: string | null;
};

type Key = 'class_year' | 'major' | 'industry' | 'city' | 'company';
const FILTERS: { key: Key; label: string; hint: string }[] = [
  { key: 'class_year', label: 'Class year', hint: 'Graduation year' },
  { key: 'major', label: 'Major', hint: 'Area of study' },
  { key: 'industry', label: 'Industry', hint: 'Industry' },
  { key: 'city', label: 'Location', hint: 'City or country' },
  { key: 'company', label: 'Company / organization', hint: 'Company' },
];

const uniq = (xs: (string | number | null)[]) =>
  Array.from(new Set(xs.filter((x) => x !== null && x !== '').map(String))).sort();

export default function AlumniDirectory({ alumni, addSlot }: { alumni: Alum[]; addSlot?: React.ReactNode }) {
  const [q, setQ] = useState('');
  const [chosen, setChosen] = useState<Partial<Record<Key, string>>>({});
  const [open, setOpen] = useState<Partial<Record<Key, boolean>>>({ class_year: true });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const options = useMemo(() => {
    const o = {} as Record<Key, string[]>;
    FILTERS.forEach((f) => { o[f.key] = uniq(alumni.map((a) => a[f.key])); });
    o.class_year.reverse();
    return o;
  }, [alumni]);

  const allOpen = FILTERS.every((f) => open[f.key]);
  const shown = alumni.filter((a) => {
    const text = [a.full_name, a.major, a.role, a.company, a.industry, a.city, a.class_year].join(' ').toLowerCase();
    if (q && !text.includes(q.trim().toLowerCase())) return false;
    return FILTERS.every((f) => !chosen[f.key] || String(a[f.key] ?? '') === chosen[f.key]);
  });

  return (
    <>
      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="alum-q" className="sr-only">Search alumni</label>
        <input id="alum-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name and/or keyword" />
        <button className="go" aria-label="Search"><Search /></button>
      </form>

      <div className="dir">
        <aside className="filters" aria-label="Filters">
          <div className="filters-head">
            <h2>Filter by</h2>
            <button
              onClick={() => setOpen(allOpen ? {} : Object.fromEntries(FILTERS.map((f) => [f.key, true])))}
              style={{ background: 'none', border: 0, fontSize: 15, cursor: 'pointer', minHeight: 44 }}
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
          {FILTERS.map((f) => (
            <div key={f.key} style={{ borderBottom: '1px solid #d9d9d9' }}>
              <button className="filter-toggle" aria-expanded={!!open[f.key]} onClick={() => setOpen((o) => ({ ...o, [f.key]: !o[f.key] }))}>
                {f.label} <Chevron open={!!open[f.key]} size={18} />
              </button>
              {open[f.key] && (
                <div className="filter-body">
                  <label htmlFor={`flt-${f.key}`} style={{ fontSize: 15 }}>{f.hint}</label>
                  <select
                    id={`flt-${f.key}`}
                    className="select"
                    value={chosen[f.key] ?? ''}
                    onChange={(e) => setChosen((c) => ({ ...c, [f.key]: e.target.value }))}
                  >
                    <option value="">Any</option>
                    {options[f.key].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
            </div>
          ))}
        </aside>

        <div className="dir-results">
          {addSlot}
          <div className="dir-bar">
            <p style={{ fontSize: 18 }}>{shown.length} {shown.length === 1 ? 'person' : 'people'}</p>
            <div className="toggle">
              <span>View:</span>
              <button aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
              <button aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</button>
            </div>
          </div>

          {alumni.length === 0 ? (
            <p className="notice">No alumni yet. Be the first to add yourself.</p>
          ) : shown.length === 0 ? (
            <p className="notice">No matches.</p>
          ) : (
            <div className={`alumni-grid${view === 'list' ? ' list' : ''}`}>
              {shown.map((a) => (
                <div key={a.id} className="alum">
                  <div className="letter">
                    {a.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photo_url} alt={a.full_name} />
                    ) : (
                      a.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                    {a.linkedin_url ? (
                      <a className="name" href={a.linkedin_url} target="_blank" rel="noreferrer">{a.full_name} →</a>
                    ) : (
                      <span className="name">{a.full_name}</span>
                    )}
                    {(a.class_year || a.major) && (
                      <p>{[a.class_year && `Class of ${a.class_year}`, a.major].filter(Boolean).join(' · ')}</p>
                    )}
                    {(a.role || a.company) && (
                      <>
                        <p style={{ marginTop: 6, fontSize: 14 }}>Current position</p>
                        {a.role && <p style={{ fontWeight: 700 }}>{a.role}</p>}
                        {a.company && <p>{a.company}</p>}
                      </>
                    )}
                    {a.city && (
                      <p style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Pin />{a.city}</p>
                    )}
                    {a.email && <a href={`mailto:${a.email}`} style={{ fontSize: 15 }}>{a.email}</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
