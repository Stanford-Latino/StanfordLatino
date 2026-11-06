import type { MetadataRoute } from 'next';
import { initiatives } from '@/content/site';

const SITE = 'https://www.stanfordlatinos.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, priority: 1 },
    { url: `${SITE}/about`, priority: 0.8 },
    ...initiatives.map((i) => ({ url: `${SITE}/initiatives/${i.slug}`, priority: 0.7 })),
  ];
}
