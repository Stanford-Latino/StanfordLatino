import type { Metadata } from 'next';
import Link from 'next/link';
import { memberPages } from '@/content/site';

export const metadata: Metadata = { title: 'Members · Stanford Latino' };

export default function MembersHome() {
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
    </div>
  );
}
