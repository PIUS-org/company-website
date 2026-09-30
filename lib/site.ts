/* Canonical site address. Vercel sets NEXT_PUBLIC_SITE_URL; the fallback keeps OG/sitemap URLs valid if it is missing. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pius.co.kr').replace(/\/+$/, '');
