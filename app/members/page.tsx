import type { Metadata } from 'next';
import Link from 'next/link';
import { memberPages } from '@/content/site';
import { createClient, getUser } from '@/lib/supabase/server';
import { isBoardMember, isPresident } from '@/lib/board';
import AddPanel, { Field } from '@/components/AddPanel';
import { addBoardEmail, removeBoardEmail } from './actions';

export const metadata: Metadata = { title: 'Members · Stanford Latino' };

export default async function MembersHome() {
  const [board, president] = await Promise.all([isBoardMember(), isPresident()]);
  let boardList: { email: string; name: string | null; role: string }[] = [];
  let me = '';
  if (board) {
    const supabase = await createClient();
    const { data } = await supabase.from('board_members').select('email, name, role').order('role', { ascending: false }).order('name');
    boardList = data ?? [];
    me = (await getUser())?.email?.toLowerCase() ?? '';
  }

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Members</h1>

      <nav className="member-index" aria-label="Members sections">
        {memberPages.map((p) => (
          <Link key={p.href} href={p.href}>
            <span className="name">{p.label}</span>
            <span className="desc">{p.description}</span>
            <span className="arrow" aria-hidden>→</span>
          </Link>
        ))}
      </nav>

      {board && (
        <section className="board-access">
          <h2>Board</h2>
          <p>
            {president
              ? 'Board members can add and edit events, photos, jobs and alumni. Only presidents can change this list.'
              : 'Board members can add and edit events, photos, jobs and alumni. Ask a president to change this list.'}
          </p>
          <ul>
            {boardList.map((b) => (
              <li key={b.email}>
                <span>
                  <b>{b.name || b.email}</b>
                  {b.name && <span className="muted"> · {b.email}</span>}
                  {b.role === 'president' && <span className="muted"> · President</span>}
                </span>
                {president && b.email.toLowerCase() !== me && (
                  <form action={removeBoardEmail}>
                    <input type="hidden" name="email" value={b.email} />
                    <button className="text-btn">Remove</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {president && (
            <AddPanel buttonLabel="Add a board member" title="Add a board member" submitLabel="Give access" action={addBoardEmail} align="start">
              <Field label="Name" name="name" />
              <Field label="Stanford email" name="email" type="email" required placeholder="name@stanford.edu" />
              <Field label="Role" name="role">
                <option value="board">Board member</option>
                <option value="president">President</option>
              </Field>
            </AddPanel>
          )}
        </section>
      )}
    </div>
  );
}
