/* Canonical site address. Vercel sets NEXT_PUBLIC_SITE_URL; the fallback keeps OG/sitemap URLs valid if it is missing. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pius.co.kr').replace(/\/+$/, '');

/* Sub pages that set their own openGraph replace the root one entirely (Next merges metadata shallowly),
   so they spread this in to keep the site name and share image. */
export const OG_BASE = {
  type: 'website' as const, siteName: 'PIUS', locale: 'ko_KR',
  images: [{ url: '/og/og-image.png', width: 1200, height: 630, alt: 'PIUS — Build Your Growth' }],
};
