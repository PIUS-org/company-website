import type { Metadata } from 'next';
import Site from '@/components/Site';
import { getProjects } from '@/lib/portfolio';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Page() {
  return <Site projects={getProjects()} />;
}
