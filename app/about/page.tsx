import type { Metadata } from 'next';
import { about } from '@/content/site';

export const metadata: Metadata = { title: 'About Us · Stanford Latino' };

export default function AboutPage() {
  return (
    <div className="page" style={{ maxWidth: 1000, gap: 64 }}>
      <div className="page-head">
        <h1 className="page-title">About Us</h1>
      </div>

      <div id="serve" className="about-row">
        <h2>Who We Serve</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {about.whoWeServe.map((p) => (
            <p key={p} className="body-lg">{p}</p>
          ))}
        </div>
      </div>

      <div id="join" className="about-row">
        <h2>How to Join</h2>
        <ol className="steps">
          {about.howToJoin.map((s, i) => (
            <li key={s.title}>
              <span className="n">{i + 1}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ fontSize: 18, fontWeight: 700 }}>{s.title}</p>
                <p style={{ fontSize: 16, lineHeight: 1.6 }}>{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
