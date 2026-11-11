import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { STAGE, getProjects } from '@/lib/portfolio';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/`, lastModified: now }];
  /* only a public build lists the portfolio; its manifest already holds approved projects only */
  if (STAGE === 'public') {
    pages.push({ url: `${SITE_URL}/portfolio`, lastModified: now });
    for (const p of getProjects()) if (p.status === 'approved') pages.push({ url: `${SITE_URL}/portfolio/${p.slug}`, lastModified: now });
  }
  return pages;
}
