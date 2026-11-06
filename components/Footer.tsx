import { contact } from '@/content/site';
import { InstagramIcon, TikTokIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="socials">
        <a href={contact.instagram.url} aria-label="Stanford Latino on Instagram" target="_blank" rel="noreferrer"><InstagramIcon /></a>
        <a href={contact.tiktok.url} aria-label="Stanford Latino on TikTok" target="_blank" rel="noreferrer"><TikTokIcon /></a>
      </div>
      <span>© {new Date().getFullYear()} Stanford Latino</span>
    </footer>
  );
}
