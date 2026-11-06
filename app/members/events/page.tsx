import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import EventsCalendar, { type CalEvent } from './EventsCalendar';
import AddPanel, { Field } from '@/components/AddPanel';
import { createEvent } from '../actions';

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
      <AddPanel buttonLabel="Add event" title="Add an event" submitLabel="Add to calendar" action={createEvent}>
        <Field label="Event name" name="title" required placeholder="e.g. Friday Social" />
        <Field label="Type" name="category" required>
          <option value="social">Social</option>
          <option value="career">Career</option>
          <option value="speaker">Speaker series</option>
          <option value="philanthropy">Philanthropy</option>
        </Field>
        <Field label="Date and time" name="starts_at" type="datetime-local" required />
        <Field label="Location" name="location" placeholder="e.g. El Centro Chicano" />
        <Field label="Description" name="description" type="textarea" wide />
      </AddPanel>
      <EventsCalendar events={(data ?? []) as CalEvent[]} />
    </div>
  );
}
