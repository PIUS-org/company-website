/* =========================================================
   Web blocks → PDF pages. Same project data, page-sized layout.
   Page count follows the content: long flows, many screens or many features spill onto
   extra pages; blocks with pdf.skip are left out; scope + statement close the document.
   ========================================================= */
import type { Block, CoverBlock, L, FeatureGridBlock, ImageAsset, OverviewBlock, Project, ResultsBlock, ScopeBlock,
  ServicesBlock, StatementBlock, TextImageBlock, UserFlowBlock } from './types';
import { imagesOf } from './text';

export type PrintFormat = 'a4' | '169';
export const FORMATS: Record<PrintFormat, { w: string; h: string; label: string }> = {
  a4: { w: '297mm', h: '210mm', label: 'A4 landscape' },
  '169': { w: '338.67mm', h: '190.5mm', label: '16:9' },
};

export type PrintPage =
  | { kind: 'cover'; b: CoverBlock }
  | { kind: 'overview'; b: OverviewBlock }
  | { kind: 'services'; b: ServicesBlock }
  | { kind: 'flow'; b: UserFlowBlock; steps: UserFlowBlock['steps']; part: number; per: number }
  | { kind: 'feature'; b: TextImageBlock; images: ImageAsset[] }
  | { kind: 'screens'; b: Block; title?: L; images: ImageAsset[]; part: number }
  | { kind: 'grid'; b: FeatureGridBlock; items: FeatureGridBlock['items']; part: number; per: number; more?: FeatureGridBlock[] }
  | { kind: 'results'; b: ResultsBlock }
  | { kind: 'closing'; scope?: ScopeBlock; statement?: StatementBlock };

const chunk = <T,>(a: T[], n: number): T[][] => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
/** how many screens fit on one page next to each other */
const perPage = (imgs: ImageAsset[]) => (imgs.every(i => i.kind === 'mobile') ? 4 : imgs.every(i => i.kind === 'tablet') ? 2 : imgs.some(i => i.kind === 'mobile') ? 3 : 1);

export type PrintMode = 'full' | 'external';
export const PRINT_MODES: PrintMode[] = ['full', 'external'];

/**
 * External (submission) edition: the same pages, trimmed to the essentials — 5–7 pages when the content allows.
 * Kept: cover · overview · first flow page · the first two feature pages · one page of extra (mobile) screens ·
 * the first feature grid · results · closing. Then, while more than 7 pages remain, the least important page goes
 * (extra screens → services → feature grid → second feature). Nothing is padded: short projects stay short.
 */
/**
 * The project as the External edition sees it. When screens carry a presentation tier (images[].presentation),
 * only the screens marked `external` are used (core screens otherwise, never support/hidden), the cover keeps its
 * external screens, and a screen already on the cover is not repeated on later pages. Blocks left without a screen
 * are dropped; text-only blocks stay. Projects without tiers are returned unchanged (previous behaviour).
 */
export function externalView(p: Project): Project {
  const all = Object.values(p.images);
  if (!all.some(i => i.tier)) return p;
  const pick = all.some(i => i.external) ? (id: string) => !!p.images[id]?.external : (id: string) => p.images[id]?.tier === 'core';
  const cover = p.blocks.find((b): b is CoverBlock => b.type === 'cover');
  /* cover: its own external screens; if it has none, the first external screen of the page (not a non-preferred one) */
  const firstPick = p.blocks.flatMap(b => ('images' in b && b.type !== 'cover' ? b.images : b.type === 'userFlow' ? b.steps.map(st => st.image || '') : [])).find(id => id && pick(id));
  const coverIds = cover ? (cover.images.filter(pick).length ? cover.images.filter(pick) : firstPick ? [firstPick] : cover.images.filter(id => p.images[id]?.tier === 'core').slice(0, 1)) : [];
  const keep = (id: string) => pick(id) && !coverIds.includes(id);
  const blocks: Block[] = [];
  for (const b of p.blocks) {
    switch (b.type) {
      case 'cover': blocks.push({ ...b, images: coverIds }); break;
      case 'textImage': case 'screenShowcase': case 'imageGallery': {
        const images = b.images.filter(keep);
        if (images.length) blocks.push({ ...b, images } as Block);
        break;
      }
      case 'userFlow': blocks.push({ ...b, steps: b.steps.map(st => (st.image && !keep(st.image) ? { ...st, image: undefined } : st)) }); break;
      case 'featureGrid': {
        if (!b.items.some(it => it.image)) { blocks.push(b); break; }
        const items = b.items.filter(it => it.image && keep(it.image));
        if (items.length) blocks.push({ ...b, items });
        break;
      }
      default: blocks.push(b);
    }
  }
  return { ...p, blocks };
}

/**
 * External (submission) edition: the same pages, trimmed to the essentials — 5–7 pages when the content allows.
 * Built from externalView(): pages that carry External screens rank first after cover · overview · closing,
 * then the user flow (kept whole or dropped whole — a flow cut in half reads wrong), text feature grids, services.
 * Nothing is padded: short projects stay short.
 */
export function paginateExternal(p: Project): PrintPage[] {
  const view = externalView(p);
  const tiered = view !== p;
  const full = paginate(view);
  /* two feature pages when untiered: the first, then the first from a different section (e.g. EDIT + REVIEW) */
  const feats = full.filter(pg => pg.kind === 'feature');
  const label = (pg: PrintPage) => ('b' in pg && pg.b && 'section' in pg.b ? pg.b.section?.label : undefined);
  const second = feats.slice(1).find(pg => label(pg) !== label(feats[0])) || feats[1];
  const chosen = new Set(tiered ? feats : [feats[0], second].filter(Boolean));
  const seen = { feature: 0, screens: false, grid: false, services: false };
  const keep: { pg: PrintPage; rank: number; group?: string }[] = [];
  for (const pg of full) {
    switch (pg.kind) {
      case 'cover': case 'overview': case 'closing': keep.push({ pg, rank: 9 }); break;
      case 'results': keep.push({ pg, rank: 8 }); break;
      case 'flow': keep.push({ pg, rank: pg.steps.some(st => st.image) ? 7.5 : 6, group: 'flow' }); break;
      case 'feature': if (chosen.has(pg)) keep.push({ pg, rank: tiered ? 8 - seen.feature++ * 0.01 : seen.feature++ === 0 ? 7 : 3 }); break;
      case 'services': if (!seen.services) { seen.services = true; keep.push({ pg, rank: 2 }); } break;
      case 'grid':
        if (pg.items.some(it => it.image)) { if (tiered) keep.push({ pg, rank: 7.8 }); }
        else if (!seen.grid && pg.part === 0) { seen.grid = true; keep.push({ pg, rank: seen.feature ? 2.5 : 6 }); }
        break;
      case 'screens':
        if (tiered) keep.push({ pg, rank: 7.9 - pg.part * 0.01 });
        /* one page of supplementary screens; a showcase that is the project's main visual (no feature pages) ranks higher */
        else if (!seen.screens && pg.part === 0) { seen.screens = true; keep.push({ pg, rank: seen.feature ? 1 : 6 }); }
        break;
    }
  }
  while (keep.length > 7) {
    let lo = -1;
    keep.forEach((k, i) => { if (lo < 0 || k.rank < keep[lo].rank || (k.rank === keep[lo].rank && i > lo)) lo = i; });
    const g = keep[lo].group;
    if (g) { for (let i = keep.length - 1; i >= 0; i--) if (keep[i].group === g) keep.splice(i, 1); }
    else keep.splice(lo, 1);
  }
  return keep.map(k => k.pg);
}

export const pagesFor = (p: Project, mode: PrintMode) => (mode === 'external' ? paginateExternal(p) : paginate(p));

export function paginate(p: Project): PrintPage[] {
  const pages: PrintPage[] = [];
  let scope: ScopeBlock | undefined, statement: StatementBlock | undefined;
  for (const b of p.blocks) {
    if (b.pdf?.skip) continue;
    switch (b.type) {
      case 'cover': pages.push({ kind: 'cover', b }); break;
      case 'overview': pages.push({ kind: 'overview', b }); break;
      case 'services': pages.push({ kind: 'services', b }); break;
      case 'userFlow': {
        /* even split: 7 steps → 4 + 3, 10 → 5 + 5; text-only flows of up to 6 steps stay on one page */
        const max = b.steps.some(st => st.image) ? 5 : 6;
        const parts = Math.ceil(b.steps.length / max), per = Math.ceil(b.steps.length / parts);
        chunk(b.steps, per).forEach((steps, part) => pages.push({ kind: 'flow', b, steps, part, per }));
        break;
      }
      case 'textImage': {
        const imgs = imagesOf(p, b.images);
        const first = imgs[0]?.kind === 'mobile' ? imgs.filter(i => i.kind === 'mobile').slice(0, 2) : imgs.slice(0, 1);
        pages.push({ kind: 'feature', b, images: first });
        const rest = imgs.filter(i => !first.includes(i));
        if (rest.length) chunk(rest, perPage(rest)).forEach((images, part) => pages.push({ kind: 'screens', b, title: b.heading, images, part: part + 1 }));
        break;
      }
      case 'screenShowcase':
      case 'imageGallery': {
        const imgs = imagesOf(p, b.images);
        chunk(imgs, perPage(imgs)).forEach((images, part) => pages.push({ kind: 'screens', b, title: b.heading, images, part }));
        break;
      }
      case 'featureGrid': {
        /* short text-only grids share a page (up to 8 cards in total) instead of leaving half-empty pages */
        const last = pages[pages.length - 1];
        if (last?.kind === 'grid' && last.items.length + (last.more || []).reduce((n, m) => n + m.items.length, 0) + b.items.length <= 8
          && ![last.b, ...(last.more || []), b].some(g => g.items.some(it => it.image))) { (last.more ||= []).push(b); break; }
        /* cards with screens: desktop 2 per page, mixed 3, phones 4 — so the screens stay readable */
        const withImg = b.items.filter(it => it.image && p.images[it.image]?.src && p.images[it.image].tier !== 'hidden');
        const per = withImg.length ? (withImg.every(it => p.images[it.image!].kind === 'mobile') ? 4 : withImg.some(it => p.images[it.image!].kind === 'mobile') ? 3 : 2) : 6;
        chunk(b.items, per).forEach((items, part) => pages.push({ kind: 'grid', b, items, part, per }));
        break;
      }
      case 'results': pages.push({ kind: 'results', b }); break;
      case 'scope': scope = b; break;
      case 'statement': statement = b; break;
    }
  }
  if ((scope && p.scope.some(x => !x.pending)) || statement) pages.push({ kind: 'closing', scope, statement });
  return pages;
}
