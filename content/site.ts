// ─────────────────────────────────────────────────────────────
// Edit this file to change the public website's text.
// Board, initiatives, past events, contact info all live here.
// Photos go in /public/images and are referenced as '/images/<file>'.
// ─────────────────────────────────────────────────────────────

export const contact = {
  email: 'stanfordlatino@outlook.com',
  instagram: { handle: 'stanford_latino', url: 'https://www.instagram.com/stanford_latino/' },
  tiktok: { handle: 'stanfordlatino', url: 'https://www.tiktok.com/@stanfordlatino' },
};

export const welcome = {
  title: 'Welcome to Stanford Latino',
  paragraphs: [
    'Stanford Latino is a student-led undergraduate organization that prepares Latin American Stanford students for leadership through training, guidance, resources and a large international network.',
    'Through pre-professional, social and philanthropic initiatives, we bring the Latino community at Stanford together and build meaningful relationships with the wider Stanford community.',
  ],
};

export type Person = { name: string; role: string; photo?: string };

export const board: { label: string; size: number; members: Person[] }[] = [
  {
    label: 'Co-Presidents & Financial Officer',
    size: 148,
    members: [
      { name: 'Manuel Palomares', role: 'Co-President', photo: '/images/manuel.jpg' },
      { name: 'Sigal Malka', role: 'Co-President', photo: '/images/sigal.jpg' },
      { name: 'Andres Palacios', role: 'Financial Officer', photo: '/images/andres.jpg' },
    ],
  },
  {
    label: 'Vice Presidents',
    size: 124,
    members: [
      { name: "Federica D'Alvano", role: 'VP, Relations' },
      { name: 'Jose Pablo Perez', role: 'VP, Relations' },
      { name: 'Sophie Profit', role: 'VP, Marketing' },
      { name: 'Maura Osorio', role: 'VP, Filantropía' },
      { name: 'Mateo Lopez', role: 'VP, Internships' },
      { name: 'Natalia Vergara', role: 'VP, Comunidad' },
      { name: 'Mariana Simon', role: 'VP, Comunidad' },
      { name: 'Evaristo Derby', role: 'VP, Comunidad' },
      { name: 'Mateo Perez', role: 'VP, Speaker Series' },
      { name: 'Fausto Ramon', role: 'VP, Speaker Series' },
    ],
  },
  {
    label: 'Directors',
    size: 124,
    members: [
      { name: 'Lucia Lecour', role: 'Director, Relations' },
      { name: 'Andres Angrisano', role: 'Director, Relations' },
      { name: 'Stella Maris Leon V.', role: 'Director, Marketing' },
      { name: 'Sara Garza', role: 'Director, Filantropía' },
      { name: 'Alex Knoepffler', role: 'Director, Internships' },
      { name: 'Fer Valdes', role: 'Director, Internships' },
      { name: 'Alejandro Pulido', role: 'Director, Comunidad' },
      { name: 'Alessia Digalo', role: 'Director, Comunidad' },
      { name: 'David Cardenas', role: 'Director, Speaker Series' },
    ],
  },
];

export type PastEvent = { name: string; date: string; description: string; photo?: string };
export type Initiative = {
  slug: string;
  title: string;
  blurb: string; // short text on the home page card
  body: string; // longer text at the top of the initiative page
  photo?: string;
  stats?: { value: string; label: string }[];
  events: PastEvent[];
};

const placeholderEvents: PastEvent[] = [
  { name: '[Event name]', date: '[Month DD, YYYY]', description: '[A sentence or two about the event: who came, what happened.]' },
  { name: '[Event name]', date: '[Month DD, YYYY]', description: '[A sentence or two about the event: who came, what happened.]' },
  { name: '[Event name]', date: '[Month DD, YYYY]', description: '[A sentence or two about the event: who came, what happened.]' },
];

export const initiatives: Initiative[] = [
  {
    slug: 'comunidad',
    title: 'Comunidad',
    blurb: 'Socials, dinners and traditions that make Stanford Latino a home on campus.',
    body: 'Socials, dinners and traditions that bring Latino students together and make Stanford Latino a home on campus.',
    events: placeholderEvents,
  },
  {
    slug: 'speaker-series',
    title: 'Speaker Series',
    blurb: 'Founders, executives and leaders from Latin America and the US, in conversation with Stanford students.',
    body: 'Founders, executives and leaders from Latin America and the US, in conversation with Stanford students.',
    events: placeholderEvents,
  },
  {
    slug: 'philanthropy',
    title: 'Philanthropy',
    blurb: 'Service and fundraising that give back to Latino communities on campus and beyond.',
    body: 'Service and fundraising that give back to Latino communities on campus and beyond.',
    events: placeholderEvents,
  },
  {
    slug: 'relations',
    title: 'Relations',
    blurb: 'Partnerships with companies and organizations that open doors for Stanford students.',
    body: 'Partnerships with companies and organizations that open doors for Stanford students.',
    events: placeholderEvents,
  },
  {
    slug: 'internships',
    title: 'Internships',
    blurb: 'Connecting Stanford students with internships at companies across Latin America.',
    body: 'Connecting Stanford students with internships at companies across Latin America. Open roles live on the members-only Jobs board.',
    stats: [
      { value: '12+', label: 'partner companies' },
      { value: '300+', label: 'applications' },
      { value: '~60', label: 'students placed' },
    ],
    events: placeholderEvents,
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    blurb: 'Our brand and merch, including the Estanfor hats, a Stanford Latino staple.',
    body: 'Our brand, social media and merch, including the Estanfor hats, the staple everyone on campus knows us for.',
    events: [
      { name: 'Estanfor Hats', date: '[Month YYYY]', description: 'Our staple, much-loved Estanfor hats. [Add the story behind them.]' },
      ...placeholderEvents.slice(0, 2),
    ],
  },
];

export const about = {
  whoWeServe: [
    'Every Stanford undergraduate. Stanford Latino brings together students from across Latin America and Latino students from the US, and anyone who wants to be part of the community.',
    'Members get our alumni directory, events calendar, jobs board and photo albums, plus mentorship and application support from the board.',
  ],
  howToJoin: [
    { title: 'Join the mailing list', description: 'Event invites and opportunities, straight to your inbox: [mailing list link]' },
    { title: 'Come to an event', description: 'Comunidad socials, speaker events and service days are open to all undergrads.' },
    { title: 'Log in as a member', description: 'Use your @stanford.edu email to log in to the alumni directory, events, jobs and photos.' },
    { title: 'Join the board', description: 'Board applications open each [quarter]. Dates go out on the mailing list.' },
  ],
};

export const memberPages = [
  { href: '/members/alumni', label: 'Alumni Directory', description: 'Find alumni for coffee chats, referrals and mentoring.' },
  { href: '/members/events', label: 'Events', description: 'Everything coming up, color coded.' },
  { href: '/members/jobs', label: 'Jobs', description: 'Open roles from the companies we work with.' },
  { href: '/members/photos', label: 'Photos', description: 'Albums from every event.' },
];

export function initials(name: string) {
  const parts = name.replace(/[^A-Za-zÀ-ÿ' ]/g, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
