/* Server-side access to the published portfolio.
   .portfolio/manifest.json is written by `node scripts/portfolio.mjs sync` (runs before dev / build / typecheck)
   and already contains only the projects allowed in the current stage. */
import data from '@/.portfolio/manifest.json';
import type { Manifest, Project } from './types';

const manifest = data as unknown as Manifest;

export const STAGE = manifest.stage;
export const getProjects = (): Project[] => manifest.projects;
export const getProject = (slug: string): Project | undefined => manifest.projects.find(p => p.slug === slug);
/** following project in list order, wrapping around; null when there is only one */
export const getNextProject = (slug: string): Project | null => {
  const list = manifest.projects, i = list.findIndex(p => p.slug === slug);
  return list.length > 1 && i >= 0 ? list[(i + 1) % list.length] : null;
};
/** PDF/print pages are only generated for local export and the Claude preview (PORTFOLIO_PRINT=1). */
export const PRINT_ENABLED = process.env.PORTFOLIO_PRINT === '1';
export const getPrintable = (): Project[] => (PRINT_ENABLED ? manifest.projects.filter(p => p.includeInPdf) : []);
