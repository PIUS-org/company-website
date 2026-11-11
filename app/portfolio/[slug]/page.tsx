import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectPage } from '@/components/Portfolio/pages';
import { STAGE, getNextProject, getProject, getProjects } from '@/lib/portfolio';
import { OG_BASE } from '@/lib/site';

/* Every published project is pre-rendered; any other slug is a 404 (also on a Node server). */
export const dynamicParams = false;
export function generateStaticParams() {
  return getProjects().map(p => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  const title = `${p.title.ko} — ${p.subtitle.ko} | PIUS`;
  return {
    title, description: p.summary.ko,
    alternates: { canonical: `/portfolio/${p.slug}` },
    openGraph: { ...OG_BASE, url: `/portfolio/${p.slug}`, title, description: p.summary.ko },
    ...(STAGE !== 'public' || p.status !== 'approved' ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  return <ProjectPage p={p} next={getNextProject(slug)} />;
}
