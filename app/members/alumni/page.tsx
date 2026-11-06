import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AlumniDirectory, { type Alum } from './AlumniDirectory';
import AddPanel, { Field } from '@/components/AddPanel';
import ImageField from '@/components/ImageField';
import { addAlum, importAlumni } from '../actions';
import { isBoardMember, resolvePhoto, signPaths } from '@/lib/board';

export const metadata: Metadata = { title: 'Alumni Directory · Stanford Latino' };

export default async function AlumniPage() {
  const supabase = await createClient();
  const [{ data }, board] = await Promise.all([
    supabase
      .from('alumni')
      .select('id, full_name, class_year, major, role, company, industry, city, linkedin_url, email, photo_url')
      .order('full_name'),
    isBoardMember(),
  ]);
  const rows = (data ?? []) as Alum[];
  const signed = await signPaths(rows.map((r) => r.photo_url));
  const alumni = rows.map((r) => ({ ...r, photo_url: resolvePhoto(r.photo_url, signed) }));

  return (
    <div className="page" style={{ maxWidth: 1240 }}>
      <div className="page-head" style={{ gap: 18 }}>
        <h1 className="page-title" style={{ fontSize: 72 }}>Alumni Directory</h1>
        <p className="lede" style={{ fontSize: 20 }}>
          Find Stanford Latino alumni by name, class, company or city, and reach out for coffee chats, referrals and mentoring.
        </p>
      </div>

      <AlumniDirectory
        alumni={alumni}
        addSlot={
          <>
            <AddPanel
              variant="banner"
              bannerQuestion={board ? 'Know a Stanford Latino alum?' : 'Are you a Stanford Latino alum?'}
              buttonLabel={board ? 'Add an alum to the directory' : 'Add yourself to the directory'}
              title={board ? 'Add an alum' : 'Join the alumni directory'}
              submitLabel={board ? 'Add to directory' : 'Add me'}
              action={addAlum}
            >
              <Field label="Full name" name="full_name" required />
              <Field label="Class year" name="class_year" type="number" placeholder="e.g. 2027" />
              <Field label="Major" name="major" />
              <Field label="Current role" name="role" placeholder="e.g. Product Manager" />
              <Field label="Company" name="company" />
              <Field label="Industry" name="industry" placeholder="e.g. Consulting, Tech, Finance" />
              <Field label="City" name="city" placeholder="e.g. Mexico City" />
              <Field label="LinkedIn" name="linkedin_url" placeholder="linkedin.com/in/…" />
              <Field label="Email to share" name="email" type="email" />
              <ImageField label="Photo (optional)" name="photo_path" folder="alumni" />
            </AddPanel>
            {board && (
              <AddPanel buttonLabel="Upload a spreadsheet (board)" title="Add many alumni at once" submitLabel="Upload" action={importAlumni} align="start">
                <div className="field wide" style={{ gap: 10 }}>
                  <p style={{ fontSize: 16, lineHeight: 1.6 }}>
                    1. Download the <a href="/alumni-template.csv" download>template</a> and fill one person per row
                    (only <b>full_name</b> is required).<br />
                    2. Save it as CSV: in Google Sheets, <i>File → Download → .csv</i>; in Excel, <i>Save As → CSV</i>.<br />
                    3. Upload it here.
                  </p>
                  <label htmlFor="csv" className="label">Spreadsheet (.csv)</label>
                  <input id="csv" name="file" type="file" accept=".csv,text/csv" className="input" required />
                </div>
              </AddPanel>
            )}
          </>
        }
      />
    </div>
  );
}
