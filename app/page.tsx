import type { Metadata } from 'next';
import Site from '@/components/Site';
import { getProjects } from '@/lib/portfolio';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Page() {
  /* the home page only counts projects per category: send just that field, not all 84 projects (~900KB of HTML) */
  return <Site projects={getProjects().map(p => ({ mainCategory: p.mainCategory }))} />;
}
