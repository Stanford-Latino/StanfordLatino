import type { MetadataRoute } from 'next';

// Lets people "Add to Home Screen" and get the Stanford Latino logo as an app icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stanford Latino',
    short_name: 'Stanford Latino',
    description: 'Stanford Latino — community, events, jobs and alumni.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8C1515',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
