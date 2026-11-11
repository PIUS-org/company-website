import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PrintDoc from '@/components/Portfolio/print/PrintDoc';
import { LANGS, type Lang } from '@/lib/i18n';
import { getPrintable } from '@/lib/portfolio';

/* PDF layout. Only generated when PORTFOLIO_PRINT=1 (local export / Claude preview);
   on the public site these URLs are 404 — visitors never get a PDF route. */
export const dynamicParams = false;
export function generateStaticParams() {
  return getPrintable().flatMap(p => LANGS.map(lang => ({ slug: p.slug, lang })));
}
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const p = getPrintable().find(x => x.slug === slug);
  if (!p || !LANGS.includes(lang as Lang)) notFound();
  return <PrintDoc p={p} lang={lang as Lang} />;
}
