import type { Metadata } from 'next';
import { PortfolioIndexPage } from '@/components/Portfolio/pages';
import { STAGE, getProjects } from '@/lib/portfolio';
import { OG_BASE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Portfolio — PIUS',
  description: '피우스(PIUS)가 기획하고 개발한 ERP·플랫폼·모바일 앱·웹 시스템 프로젝트',
  alternates: { canonical: '/portfolio' },
  openGraph: { ...OG_BASE, url: '/portfolio', title: 'Portfolio — PIUS', description: '피우스(PIUS)가 기획하고 개발한 ERP·플랫폼·모바일 앱·웹 시스템 프로젝트' },
  ...(STAGE !== 'public' ? { robots: { index: false, follow: false } } : {}),
};

export default function Page() {
  return <PortfolioIndexPage projects={getProjects()} />;
}
