/* Small helpers shared by the web renderer and the print renderer (client-safe). */
import { glue, type Lang } from '@/lib/i18n';
import { asset } from '@/lib/paths';
import type { ImageAsset, L, Project } from './types';

/** localised text with Korean fallback */
export const tx = (v: L | undefined | null, lang: Lang): string => (v ? glue(v[lang] || v.ko || '') : '');
/** image source for the language (language-specific file first), already prefixed for the preview */
export const srcOf = (img: ImageAsset, lang: Lang): string | null => {
  const s = img.srcByLang?.[lang] || img.src;
  return s ? asset(s) : null;
};
/** images by id; a hidden screen (presentation.tier = hidden) is never returned, so it cannot be shown anywhere */
export const imagesOf = (p: Project, ids: string[] | undefined): ImageAsset[] => (ids || []).map(id => p.images[id]).filter(i => i && i.tier !== 'hidden');
/** a single image by id, unless hidden */
export const imageOf = (p: Project, id: string | undefined): ImageAsset | undefined => (id && p.images[id]?.tier !== 'hidden' ? p.images[id] : undefined);
/** CSS custom properties that scope a project's colours to its own content area */
export const accentVars = (p: Project): React.CSSProperties => ({ ['--pf-accent' as string]: p.theme.accent, ['--pf-ink' as string]: p.theme.accentInk });

/**
 * One lead card per filter tab, chosen so neighbouring tabs open with different projects:
 * as many tabs as possible get a lead no other tab (and not "all") uses; earlier projects are preferred.
 * "all" keeps the first featured project (or the first by order).
 */
export const leadsByFilter = (projects: Project[], cats: readonly string[]): Record<string, string | undefined> => {
  const out: Record<string, string | undefined> = {};
  const allLead = (projects.find(p => p.featured) || projects[0])?.slug;
  out.all = allLead;
  const cand = (c: string) => projects.filter(p => p.slug !== allLead && p.categories.includes(c as Project['categories'][number])).map(p => p.slug);
  /* matching (augmenting paths): as many tabs as possible get a project no other tab uses; earlier projects preferred */
  const owner = new Map<string, string>();
  const tryTab = (c: string, seen: Set<string>): boolean => {
    for (const slug of cand(c)) {
      if (seen.has(slug)) continue; seen.add(slug);
      const o = owner.get(slug);
      if (!o || tryTab(o, seen)) { owner.set(slug, c); return true; }
    }
    return false;
  };
  cats.forEach(c => tryTab(c, new Set()));
  owner.forEach((c, slug) => { out[c] = slug; });
  /* tabs left over (more tabs than projects): their first project */
  for (const c of cats) if (!out[c]) out[c] = cand(c)[0] || allLead;
  return out;
};
/** the tab's lead first, then the rest in their usual order */
export const withLead = (list: Project[], lead?: string) => {
  const i = list.findIndex(p => p.slug === lead);
  return i <= 0 ? list : [list[i], ...list.slice(0, i), ...list.slice(i + 1)];
};


/** "2025.01 – 2025.12" when known, otherwise the year */
export const whenOf = (p: Project) => p.period || (p.year ? String(p.year) : '');

/** the first user flow of the project (used as the visual of text-led cards and covers) */
export const flowOf = (p: Project) => p.blocks.find((b): b is Extract<Project['blocks'][number], { type: 'userFlow' }> => b.type === 'userFlow');
/** platform labels as written in the project (fallback: the platform type) */
export const platformNames = (p: Project, lang: Lang) =>
  p.platforms.map(x => tx(x.label, lang) || ({ app: 'App', web: 'Web', admin: 'Admin', desktop: 'Desktop', api: 'API' })[x.type]);
