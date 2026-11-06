import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import JobsBoard, { type Job } from './JobsBoard';

export const metadata: Metadata = { title: 'Jobs · Stanford Latino' };

export default async function JobsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('jobs')
    .select('id, company, role, location, job_type, apply_url, description, posted_at')
    .eq('is_open', true)
    .order('posted_at', { ascending: false });

  return (
    <div className="page" style={{ maxWidth: 1080, gap: 36 }}>
      <div className="page-head">
        <h1 className="page-title">Jobs</h1>
        <p className="lede">
          Roles we’ve found with the companies we’re in contact with across Latin America and the US, plus application support from the board.
        </p>
      </div>
      <JobsBoard jobs={(data ?? []) as Job[]} />
      <div className="notice">
        <h3 style={{ fontSize: 22, marginBottom: 6 }}>Need help applying?</h3>
        <p>Email us at <a href="mailto:stanfordlatino@outlook.com">stanfordlatino@outlook.com</a> for a resume or interview review with a board member.</p>
      </div>
    </div>
  );
}
