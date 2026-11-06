import { createClient, getUser } from '@/lib/supabase/server';

const SITE = 'https://www.stanfordlatinos.com';

/**
 * Emails the presidents when something is added or changed on the site.
 * Needs BREVO_API_KEY in Vercel. Never blocks or breaks the action if email fails.
 */
export async function notifyPresidents(what: string, link = '/members') {
  try {
    const key = process.env.BREVO_API_KEY;
    if (!key) return;
    const user = await getUser();
    const supabase = await createClient();
    const { data } = await supabase.rpc('president_emails');
    const me = user?.email?.toLowerCase();
    const to = ((data as string[] | null) ?? []).filter((e) => e.toLowerCase() !== me);
    if (!to.length) return;
    const who = user?.email ?? 'Someone';
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Stanford Latino', email: 'no-reply@stanfordlatinos.com' },
        to: to.map((email) => ({ email })),
        subject: `Stanford Latino: ${what}`,
        htmlContent: `<p style="font-size:16px">${escapeHtml(what)}</p><p style="font-size:15px;color:#555">By ${escapeHtml(who)}</p><p><a href="${SITE}${link}">Open on the website</a></p>`,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // ignore: notifications are best effort
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
