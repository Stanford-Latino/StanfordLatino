'use client';

import { useMemo, useState } from 'react';
import { Pin, Search } from '@/components/Icons';

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

const uniq = (xs: (string | number | null)[]) =>
  Array.from(new Set(xs.filter((x) => x !== null && x !== '').map(String))).sort();

export default function AlumniDirectory({ alumni }: { alumni: Alum[] }) {
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const years = useMemo(() => uniq(alumni.map((a) => a.class_year)).reverse(), [alumni]);
  const industries = useMemo(() => uniq(alumni.map((a) => a.industry)), [alumni]);
  const cities = useMemo(() => uniq(alumni.map((a) => a.city)), [alumni]);

  const shown = alumni.filter((a) => {
    const text = [a.full_name, a.major, a.role, a.company, a.industry, a.city, a.class_year].join(' ').toLowerCase();
    return (
      (!q || text.includes(q.trim().toLowerCase())) &&
      (!year || String(a.class_year) === year) &&
      (!industry || a.industry === industry) &&
      (!city || a.city === city)
    );
  });

  const clear = () => { setYear(''); setIndustry(''); setCity(''); };

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
            <button onClick={clear} style={{ background: 'none', border: 0, fontSize: 14, cursor: 'pointer', minHeight: 44 }}>Clear</button>
          </div>
          <Filter id="f-year" label="Class year" value={year} onChange={setYear} options={years} />
          <Filter id="f-ind" label="Industry" value={industry} onChange={setIndustry} options={industries} />
          <Filter id="f-city" label="Location" value={city} onChange={setCity} options={cities} />
        </aside>

        <div className="dir-results">
          <div className="dir-bar">
            <p>{shown.length} {shown.length === 1 ? 'person' : 'people'}</p>
            <div className="toggle">
              <span>View:</span>
              <button aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
              <button aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</button>
            </div>
          </div>

          {alumni.length === 0 ? (
            <p className="notice">No alumni yet. Add yourself with the button above.</p>
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
                    <p>{[a.class_year && `Class of ${a.class_year}`, a.major].filter(Boolean).join(' · ')}</p>
                    {(a.role || a.company) && (
                      <>
                        <p style={{ marginTop: 6, fontSize: 13 }}>Current position</p>
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

function Filter({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="filter">
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
