'use client';

import { useState } from 'react';

export type Job = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  job_type: string | null;
  apply_url: string | null;
  description: string | null;
  posted_at: string;
};

export default function JobsBoard({ jobs }: { jobs: Job[] }) {
  const [company, setCompany] = useState('All');
  const companies = ['All', ...Array.from(new Set(jobs.map((j) => j.company))).sort()];
  const shown = jobs.filter((j) => company === 'All' || j.company === company);

  if (jobs.length === 0) {
    return <p className="notice">No open roles right now. The board adds them in Supabase (see README → “Adding content”).</p>;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--line-2)', padding: '20px 0' }}>
        <p className="eyebrow">Our partners</p>
        <div className="chips">
          {companies.map((c) => (
            <button key={c} className="chip" aria-pressed={company === c} onClick={() => setCompany(c)}>{c}</button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 17 }}>{shown.length} open {shown.length === 1 ? 'role' : 'roles'}</p>
      <div>
        {shown.map((j) => (
          <div key={j.id} className="job">
            <div className="mark">{j.company.charAt(0).toUpperCase()}</div>
            <div className="info">
              <p className="company">{j.company}</p>
              <h3>{j.role}</h3>
              <p style={{ fontSize: 15 }}>{[j.location, j.job_type].filter(Boolean).join(' · ')}</p>
              {j.description && <p style={{ fontSize: 15, lineHeight: 1.5, marginTop: 4 }}>{j.description}</p>}
            </div>
            {j.apply_url && (
              <a href={j.apply_url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontWeight: 700, textDecoration: 'none', padding: '10px 4px' }}>Apply →</a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
