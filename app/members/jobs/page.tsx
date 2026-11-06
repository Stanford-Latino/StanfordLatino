import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import JobsBoard, { type Job } from './JobsBoard';
import AddPanel, { Field } from '@/components/AddPanel';
import { createJob } from '../actions';

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
      <AddPanel buttonLabel="Post a job" title="Post a job" submitLabel="Post job" action={createJob}>
        <Field label="Company" name="company" required placeholder="e.g. Aplazo" />
        <Field label="Role" name="role" required placeholder="e.g. Product Intern" />
        <Field label="Location" name="location" placeholder="e.g. Mexico City, MX" />
        <Field label="Type" name="job_type">
          <option value="Internship">Internship</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </Field>
        <Field label="Link or email to apply" name="apply_url" placeholder="Application link or recruiter email" wide />
        <Field label="Description" name="description" type="textarea" wide />
      </AddPanel>
      <JobsBoard jobs={(data ?? []) as Job[]} />
      <div className="notice">
        <h3 style={{ fontSize: 22, marginBottom: 6 }}>Need help applying?</h3>
        <p>Email us at <a href="mailto:stanfordlatino@outlook.com">stanfordlatino@outlook.com</a> for a resume or interview review with a board member.</p>
      </div>
    </div>
  );
}
