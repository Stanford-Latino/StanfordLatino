import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AlumniDirectory, { type Alum } from './AlumniDirectory';

export const metadata: Metadata = { title: 'Alumni Directory · Stanford Latino' };

export default async function AlumniPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('alumni')
    .select('id, full_name, class_year, major, role, company, industry, city, linkedin_url, email, photo_url')
    .order('full_name');

  return (
    <div className="page" style={{ maxWidth: 1240 }}>
      <div className="page-head" style={{ gap: 18 }}>
        <h1 className="page-title" style={{ fontSize: 72 }}>Alumni Directory</h1>
        <p className="lede" style={{ fontSize: 20 }}>
          Find Stanford Latino alumni by name, class, company or city — and reach out for coffee chats, referrals and mentoring.
        </p>
      </div>
      <AlumniDirectory alumni={(data ?? []) as Alum[]} />
    </div>
  );
}
