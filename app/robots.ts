import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/members', '/auth', '/login'] },
    sitemap: 'https://www.stanfordlatinos.com/sitemap.xml',
  };
}
