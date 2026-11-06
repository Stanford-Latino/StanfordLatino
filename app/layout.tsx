import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUser } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stanford Latino',
  description:
    'Stanford Latino is a student-led undergraduate organization bringing together the Latino community at Stanford.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const signedIn = Boolean(user && isAllowedEmail(user.email));
  return (
    <html lang="en">
      <body>
        <Header signedIn={signedIn} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
