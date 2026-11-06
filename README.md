# Stanford Latino — Website

This is the code for the Stanford Latino website: the public site (home, Meet the Board,
Our Initiatives, About Us, Contact) and the members area (Alumni Directory, Events, Jobs, Photos)
that only people with a **@stanford.edu** email can open.

**You don't need to know how to code to run this site.** Most yearly updates are editing
text in one file or adding rows in a spreadsheet-like table. This guide explains everything.

---

## Contents

1. [How the site works (the 4 accounts)](#1-how-the-site-works-the-4-accounts)
2. [Handing the site to the next board](#2-handing-the-site-to-the-next-board)
3. [Yearly checklist](#3-yearly-checklist)
4. [Everyday updates](#4-everyday-updates)
5. [Who can log in](#5-who-can-log-in)
6. [First-time setup (only once)](#6-first-time-setup-only-once)
7. [Troubleshooting](#7-troubleshooting)
8. [For whoever knows some code](#8-for-whoever-knows-some-code)

---

## 1. How the site works (the 4 accounts)

| Service | What it does | Cost |
|---|---|---|
| **GitHub** | Stores the code and the public text (this repository). | Free |
| **Vercel** | Puts the site online. Every change saved to GitHub goes live in about a minute. | Free (Hobby plan) |
| **Supabase** | Member logins, the members-area content (events, jobs, alumni, albums) and uploaded photos. | Free tier |
| **Domain** (e.g. from Vercel, Namecheap, Squarespace) | The web address. | ~$10–20 / year |

> **The most important rule:** these accounts must belong to the **club**, not to one person.
> Sign them up (or transfer them) with the club email **stanfordlatino@outlook.com**, and keep the
> passwords in the board's shared password manager or with the Co-Presidents and Financial Officer.
> If the only person with access graduates, the club can lose the site.

**Where the login details live:** _[write here where the board keeps the passwords, e.g. "shared 1Password vault 'Stanford Latino' — ask the Co-Presidents"]_

---

## 2. Handing the site to the next board

Do this every spring, before the outgoing board leaves:

- [ ] **GitHub:** add the incoming web person / Co-Presidents as collaborators
      (repository → Settings → Collaborators). Better: move the repository into a GitHub
      organization owned by the club email, then add people there.
- [ ] **Vercel:** add them to the project (Vercel → team/project → Settings → Members), or make sure
      they can log in to the club-owned Vercel account.
- [ ] **Supabase:** invite them (Supabase → Organization → Team).
- [ ] **Domain:** confirm who pays the renewal and when it renews. Turn on auto-renew.
      An expired domain takes the whole site down.
- [ ] Remove people who are leaving from all four accounts.
- [ ] Walk the new person through section 4 of this guide (15 minutes).
- [ ] Update the "Where the login details live" line above if it changed.

---

## 3. Yearly checklist

At the start of each year (after board elections):

- [ ] **Update Meet the Board** — names, roles and photos (see 4a).
- [ ] **Update Our Initiatives** — add last year's past events with photos (see 4b).
- [ ] **Create photo albums** for the year's first events (see 4c).
- [ ] **Add the new alumni** (last year's graduating seniors) to the Alumni Directory (see 4c).
- [ ] **Check the jobs board** — close old roles (`is_open` = false), add new ones.
- [ ] Check the contact email and Instagram/TikTok handles are still right (`content/site.ts`).
- [ ] Check the domain renewal date.

---

## 4. Everyday updates

### 4a. Public text: board, initiatives, welcome text, contact info

Everything on the public pages lives in **one file: `content/site.ts`**.

To edit it without installing anything:
1. Open this repository on github.com and click `content` → `site.ts`.
2. Click the **pencil icon** (Edit).
3. Change the text between the quotes `'like this'`. Don't delete the quotes, commas or brackets.
4. Click **Commit changes**. The site updates in about a minute.

**Changing the board** — find `export const board`. Each person looks like:
```ts
{ name: 'Sigal Malka', role: 'Co-President', photo: '/images/sigal.jpg' },
```
- To add someone, copy a line, paste it, and change the name and role.
- `photo` is optional. Without it, the site shows the person's initials.
- Board sections (Co-Presidents & Financial Officer, Advisors, Vice Presidents, Directors) are the `label:` lines.

**Adding a photo** (board headshots, initiative photos, past-event photos):
1. Make it square for headshots (about 600×600) or 4:3 for event photos, and keep it under 1 MB.
2. On github.com open `public/images` → **Add file → Upload files** → commit.
3. In `content/site.ts`, point to it: `photo: '/images/the-file-name.jpg'`.

**Adding a past event to an initiative** — find the initiative (e.g. `slug: 'speaker-series'`), then
inside its `events: [ ... ]` add:
```ts
{ name: 'Talk with [Speaker]', date: 'April 12, 2027', description: 'One or two sentences.', photo: '/images/speaker-apr-2027.jpg' },
```
Remove the `[Event name]` placeholder rows once real events are in.

### 4b. Adding or renaming an initiative
Copy a whole block in `initiatives` (from `{` to `},`), change `slug` (lowercase, dashes, used in the
web address), `title`, `blurb` (short, home page) and `body` (longer, the initiative's page).
It appears in the menu and on the home page automatically.

### 4c. Members area: events, jobs, alumni, photo albums

**Any logged-in member can add these right on the website:** a new album (Photos page), photos
(inside an album), an event (Events page), and themselves to the alumni directory (Alumni page).

To edit or remove anything (or add jobs), use **Supabase → Table Editor** (looks like a spreadsheet).
Click a table, then **Insert → Insert row**, or click a cell to edit it. Changes show on the site immediately.

| Table | One row = | Fill in |
|---|---|---|
| `events` | a calendar event | `title`, `category` (`social`, `career`, `speaker` or `philanthropy` — sets the color), `starts_at` (date + time), `location`, `description` |
| `jobs` | an open role | `company`, `role`, `location`, `job_type` (Internship / Full-time), `apply_url`, `description`. Set `is_open` to false to hide it. |
| `alumni` | an alum in the directory | `full_name`, `class_year`, `major`, `role`, `company`, `industry`, `city`, `linkedin_url`, `email` (only with their permission), `photo_url` (optional) |
| `albums` | a photo album (one per event) | `title`, `event_date`. Members add the photos themselves from the site. |
| `photos` | filled in automatically when members upload | To remove a photo: delete its row here **and** the file in **Storage → photos**. |

The partner company buttons on the Jobs page and the filters in the Alumni Directory build themselves
from what's in the tables, so you never edit those directly.

---

## 5. Who can log in

- Anyone with a **@stanford.edu** email. They type their email on the Login page and click the link
  emailed to them. No passwords.
- This is enforced in two places, so the data stays private even if someone gets past the page:
  - `lib/auth.ts` → `ALLOWED_EMAIL_DOMAINS`
  - Supabase database function `is_member()` (in `supabase/schema.sql`)
- **To let alumni in later:** add their email domain in **both** places
  (e.g. `'alumni.stanford.edu'` in `lib/auth.ts`, and `or ... ilike '%@alumni.stanford.edu'` in
  `is_member()`), then run the `is_member` part of the SQL again in Supabase → SQL Editor.

**Login emails:** Supabase's built-in email sender only allows a few emails per hour. For the whole
club, set up a free sender (e.g. Resend) in Supabase → Authentication → Emails → SMTP Settings.
The email's wording is in Authentication → Emails → Templates → Magic Link.

---

## 6. First-time setup (only once)

Already done if the site is live. Kept here in case it ever needs to be rebuilt from scratch.

1. **Supabase:** New project → **SQL Editor** → paste all of `supabase/schema.sql` → **Run**.
   Then **Project Settings → API**: copy the **Project URL** and the **anon public** key.
2. **Vercel:** **Add New → Project** → import this GitHub repository. Under **Environment Variables** add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon key
   - `NEXT_PUBLIC_SITE_URL` = the site's address, e.g. `https://www.yourdomain.com`
   Then **Deploy**.
3. **Supabase → Authentication → URL Configuration:** set **Site URL** to the site's address, and add
   `https://YOUR-SITE/auth/callback` under **Redirect URLs** (one per address the site uses).
4. **Domain:** Vercel → project → **Settings → Domains** → add the domain and follow the DNS steps
   shown (or buy it in Vercel and it connects itself). Update `NEXT_PUBLIC_SITE_URL` and the Supabase
   URLs from step 3, then redeploy.
5. Set up the email sender (section 5).

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| A change to `site.ts` didn't show up | Check Vercel → Deployments. If the latest one failed, open it to see the error — usually a missing quote or comma in `site.ts`. Fix it in GitHub and it redeploys. |
| Login email never arrives | Check spam. If many people are logging in, the built-in sender hit its limit — set up SMTP (section 5). |
| "That login link expired" | Links work once and expire after a while. Request a new one, and open it on the same device/browser. |
| Login link opens the wrong website | Supabase → Authentication → URL Configuration: the Site URL / Redirect URLs don't match the real address. |
| Members area says "Login isn't set up yet" | Vercel is missing the Supabase environment variables (section 6, step 2). |
| The whole site is down | Check the domain hasn't expired, then Vercel → Deployments. |
| Supabase project "paused" | Free projects pause after about a week with no activity. Log in to Supabase and click **Restore**. |

---

## 8. For whoever knows some code

- **Stack:** Next.js 15 (App Router, TypeScript), Supabase (`@supabase/ssr`) for auth, Postgres
  and Storage. Fonts are bundled with `@fontsource` (Playfair Display + Source Serif 4).
- **Structure**
  - `content/site.ts` — all public content
  - `app/` — pages (`page.tsx` home, `about/`, `initiatives/[slug]/`, `login/`, `members/*`, `auth/*`)
  - `components/` — header (menus), footer, icons
  - `middleware.ts` + `app/members/layout.tsx` — keep `/members/*` behind a Stanford login
  - `supabase/schema.sql` — tables, access rules (Row Level Security) and the private `photos` bucket
  - `app/globals.css` — all styling. Colors: maroon `#8C1515`, text `#111111`. Sharp corners, black text,
    white text only on maroon.
- **Run locally**
  ```bash
  npm install
  cp .env.example .env.local   # paste the Supabase values
  npm run dev                  # http://localhost:3000
  ```
- **Data safety:** every table has Row Level Security; only `is_member()` users can read, members can
  only add or delete their own photos, and everything else is edited by the board through the
  Supabase dashboard.

---

_Originally built in 2026 by the Stanford Latino board (Co-Presidents Manuel Palomares and Sigal Malka)._
