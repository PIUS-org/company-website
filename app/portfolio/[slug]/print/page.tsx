import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PrintDoc from '@/components/Portfolio/print/PrintDoc';
import { getPrintable } from '@/lib/portfolio';

/* /portfolio/<slug>/print → Korean PDF layout (same as /print/ko). */
export const dynamicParams = false;
export function generateStaticParams() {
  return getPrintable().map(p => ({ slug: p.slug }));
}
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPrintable().find(x => x.slug === slug);
  if (!p) notFound();
  return <PrintDoc p={p} lang="ko" />;
}
