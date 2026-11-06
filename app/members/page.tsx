import type { Metadata } from 'next';
import Link from 'next/link';
import { memberPages } from '@/content/site';
import { createClient, getUser } from '@/lib/supabase/server';
import { isBoardMember } from '@/lib/board';
import AddPanel, { Field } from '@/components/AddPanel';
import { addBoardEmail, removeBoardEmail } from './actions';

export const metadata: Metadata = { title: 'Members · Stanford Latino' };

export default async function MembersHome() {
  const board = await isBoardMember();
  let boardList: { email: string; name: string | null }[] = [];
  let me = '';
  if (board) {
    const supabase = await createClient();
    const { data } = await supabase.from('board_members').select('email, name').order('name');
    boardList = data ?? [];
    me = (await getUser())?.email?.toLowerCase() ?? '';
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Members</h1>
        <p className="lede">Welcome back. Everything for Stanford Latino members, in one place.</p>
      </div>
      <div className="member-tiles">
        {memberPages.map((p) => (
          <Link key={p.href} href={p.href} className="member-tile">
            <h2>{p.label}</h2>
            <p>{p.description}</p>
            <span>Open →</span>
          </Link>
        ))}
      </div>

      {board && (
        <section className="notice" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 24 }}>Board access</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>
            These people can add and edit events, photos, jobs and alumni, and approve alumni requests. Everyone else can only view.
          </p>
          {boardList.map((b) => (
            <div key={b.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: '1px solid var(--line-2)', paddingTop: 10, fontSize: 16 }}>
              <span>{b.name ? <><b>{b.name}</b> · </> : null}{b.email}</span>
              {b.email.toLowerCase() !== me && (
                <form action={removeBoardEmail}>
                  <input type="hidden" name="email" value={b.email} />
                  <button className="text-btn">Remove</button>
                </form>
              )}
            </div>
          ))}
          <AddPanel buttonLabel="Add a board member" title="Add a board member" submitLabel="Give access" action={addBoardEmail} align="start">
            <Field label="Name" name="name" />
            <Field label="Stanford email" name="email" type="email" required placeholder="name@stanford.edu" />
          </AddPanel>
        </section>
      )}
    </div>
  );
}
