import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import EventsCalendar, { type CalEvent } from './EventsCalendar';

export const metadata: Metadata = { title: 'Events · Stanford Latino' };

export default async function EventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('id, title, category, starts_at, location, description')
    .order('starts_at');

  return (
    <div className="page" style={{ maxWidth: 1180, gap: 28 }}>
      <div className="page-head">
        <h1 className="page-title">Events</h1>
        <p className="lede">Everything Stanford Latino, color coded.</p>
      </div>
      <EventsCalendar events={(data ?? []) as CalEvent[]} />
    </div>
  );
}
