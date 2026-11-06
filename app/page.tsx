import Link from 'next/link';
import { board, contact, initials, initiatives, welcome } from '@/content/site';
import { PersonIcon } from '@/components/Icons';
import Placeholder from '@/components/Placeholder';

export default function Home() {
  return (
    <>
      <section className="welcome">
        <div className="welcome-inner">
          <div className="logo" role="img" aria-label="Stanford Latino logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-stripes.png" alt="" />
            <span className="l1" aria-hidden="true">STANFORD</span>
            <span className="l2" aria-hidden="true">Latino</span>
          </div>
          <div className="welcome-text">
            <h1>{welcome.title}</h1>
            <div className="rule" aria-hidden="true" />
            {welcome.paragraphs.map((p) => (
              <p key={p} className="body-lg">{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="board" className="section" style={{ gap: 56, scrollMarginTop: 0 }}>
        <h2>Meet the Board</h2>
        {board.map((tier) => (
          <div key={tier.label} className="tier">
            <p className="tier-label">{tier.label}</p>
            <div className="members">
              {tier.members.map((m) => (
                <div key={m.name + m.role} className="member">
                  <div className="avatar" style={{ width: tier.size, height: tier.size }}>
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo} alt={m.name} />
                    ) : initials(m.name) ? (
                      <span>{initials(m.name)}</span>
                    ) : (
                      <PersonIcon />
                    )}
                  </div>
                  <div>
                    <p className="member-name">{m.name}</p>
                    <p className="member-role">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="initiatives" className="section">
        <h2>Our Initiatives</h2>
        <div className="cards">
          {initiatives.map((it) => (
            <div key={it.slug} className="card">
              {it.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="cover" src={it.photo} alt="" />
              ) : (
                <Placeholder label={`[${it.title} photo]`} />
              )}
              <h3>{it.title}</h3>
              <p>{it.blurb}</p>
              <Link href={`/initiatives/${it.slug}`} className="link-btn">Learn more →</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Questions, partnerships or speaker ideas? We’d love to hear from you.</p>
        <a className="email" href={`mailto:${contact.email}`}>{contact.email}</a>
      </section>
    </>
  );
}
