'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { initiatives, memberPages } from '@/content/site';
import { Arrow, Chevron, Lock } from './Icons';

type Menu = 'initiatives' | 'about' | 'login' | null;

export default function Header({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Menu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => { setOpen(null); setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggle = (m: Menu) => setOpen((cur) => (cur === m ? null : m));
  const close = () => { setOpen(null); setMobileOpen(false); };

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" onClick={close}>Stanford Latino</Link>
          <button className="menu-btn" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <nav className={`nav${mobileOpen ? ' open' : ''}`} aria-label="Main" ref={navRef}>
            <Link href="/#board" className="nav-link" onClick={close}>Meet the Board</Link>

            <div className="dropdown">
              <button className={`nav-link${pathname.startsWith('/initiatives') ? ' active' : ''}`} aria-expanded={open === 'initiatives'} onClick={() => toggle('initiatives')}>
                Our Initiatives <Chevron open={open === 'initiatives'} />
              </button>
              {open === 'initiatives' && (
                <div className="dropdown-panel">
                  {initiatives.map((it) => (
                    <Link key={it.slug} href={`/initiatives/${it.slug}`} className="dropdown-item" onClick={close}>{it.title}</Link>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown">
              <button className={`nav-link${pathname === '/about' ? ' active' : ''}`} aria-expanded={open === 'about'} onClick={() => toggle('about')}>
                About Us <Chevron open={open === 'about'} />
              </button>
              {open === 'about' && (
                <div className="dropdown-panel">
                  <Link href="/about#serve" className="dropdown-item" onClick={close}>Who We Serve</Link>
                  <Link href="/about#join" className="dropdown-item" onClick={close}>How to Join</Link>
                </div>
              )}
            </div>

            <Link href="/#contact" className="nav-link" onClick={close}>Contact</Link>

            <div className="dropdown">
              <button className={`nav-link${pathname.startsWith('/members') ? ' active' : ''}`} aria-expanded={open === 'login'} onClick={() => toggle('login')}>
                {signedIn ? 'Members' : 'Login'} <Chevron open={open === 'login'} />
              </button>
              {open === 'login' && (
                <div className="dropdown-panel right">
                  {memberPages.map((p) => (
                    <Link key={p.href} href={p.href} className="dropdown-item" onClick={close}>
                      {p.label} {signedIn ? <Arrow /> : <Lock />}
                    </Link>
                  ))}
                  {signedIn ? (
                    <form action="/auth/signout" method="post">
                      <button className="dropdown-item" style={{ width: '100%', fontSize: 16, textDecoration: 'underline', borderBottom: 0 }}>Log out</button>
                    </form>
                  ) : (
                    <>
                      <p className="dropdown-note">Use your student/alumni login.</p>
                      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="dropdown-cta">Log in</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      {signedIn && pathname.startsWith('/members') && (
        <nav className="subnav" aria-label="Members">
          {memberPages.map((p) => (
            <Link key={p.href} href={p.href} className={pathname.startsWith(p.href) ? 'active' : ''}>{p.label}</Link>
          ))}
          <form action="/auth/signout" method="post" style={{ display: 'contents' }}>
            <button style={{ textDecoration: 'underline', fontWeight: 400 }}>Log out</button>
          </form>
        </nav>
      )}
    </>
  );
}
