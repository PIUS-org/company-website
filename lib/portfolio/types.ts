/* =========================================================
   Portfolio content model.
   One project = content/portfolio/<slug>/project.json (+ images/).
   The same data drives the web list, the web detail page and the PDF pages.
   scripts/portfolio.mjs validates every project and writes .portfolio/manifest.json,
   which is the only thing the site reads. See docs/PORTFOLIO_SCHEMA.md.
   ========================================================= */
import type { Lang } from '@/lib/i18n';

/** Localised text. Korean is the source; en/ja are required before a project is approved. */
export type L = { ko: string; en?: string; ja?: string };

/** draft → review → approved. private never leaves the author's machine. */
export type PublishStatus = 'draft' | 'review' | 'approved' | 'private';
export type Stage = 'public' | 'review' | 'all';

export const CATEGORIES = ['erp', 'platform', 'mobile', 'web', 'commerce', 'integration'] as const;
export type Category = (typeof CATEGORIES)[number];

export const PLATFORM_TYPES = ['app', 'web', 'admin', 'desktop', 'api'] as const;
export type PlatformType = (typeof PLATFORM_TYPES)[number];
export type Platform = { type: PlatformType; label?: L };

export const PROJECT_STATES = ['inDevelopment', 'launched', 'operating', 'completed', 'maintenance'] as const;
export type ProjectState = (typeof PROJECT_STATES)[number];

export const SCOPE_KEYS = ['planning', 'ux', 'ui', 'frontend', 'app', 'backend', 'api', 'admin', 'infra', 'operation'] as const;
export type ScopeKey = (typeof SCOPE_KEYS)[number];
/** pending = not confirmed yet. Shown with a "확인 필요" tag in review builds; not allowed once approved. */
export type ScopeItem = { key: ScopeKey; label?: L; pending?: boolean };

/* ---------- images ---------- */
export type ImageKind = 'mobile' | 'desktop' | 'tablet' | 'photo' | 'graphic';
/**
 * Presentation tier of a screen (optional; images without it behave as before).
 * core = shown in the main sections · support = supporting gallery only (never cover/thumbnail) ·
 * hidden = kept in the library (file and metadata preserved) but never shown on the web or in any PDF.
 * external = preferred screen for the External (submission) PDF — core only.
 */
export type ImageTier = 'core' | 'support' | 'hidden';
/** An entry of the project's image library. Blocks refer to images by id. */
export type ImageAsset = {
  id: string;
  kind: ImageKind;
  alt: L;
  caption?: L;
  /** resolved by the sync script: /portfolio/<slug>/<file>; null while the screen is still missing */
  src: string | null;
  /** language-specific versions (e.g. an English UI screenshot) */
  srcByLang?: Partial<Record<Lang, string>>;
  width: number;
  height: number;
  /** shown in the empty frame while src is null (draft/review only) */
  placeholder?: L;
  /** from project.json images[].presentation */
  tier?: ImageTier;
  external?: boolean;
};

/** Detail-page variations: split (classic two-column), stage (centred, cinematic), editorial (magazine, big numerals), rail (framed media, sticky copy). */
export type PageLayout = 'split' | 'stage' | 'editorial' | 'rail';

/* ---------- blocks ---------- */
export type SectionLabel = { index?: string; label: string };
type Base = { id?: string; section?: SectionLabel; pdf?: { skip?: boolean } };

export type CoverBlock = Base & { type: 'cover'; eyebrow?: L; headline: L; sub?: L; images: string[] };
export type OverviewBlock = Base & { type: 'overview'; heading?: L; lead: L; body?: L; goals?: { title: L; body: L }[] };
export type ServicesBlock = Base & {
  type: 'services'; heading: L; intro?: L; note?: L; core?: L;
  columns: { platform: PlatformType; title: L; audience: L; items: L[] }[];
};
export type UserFlowBlock = Base & { type: 'userFlow'; heading: L; intro?: L; steps: { title: L; body?: L; image?: string }[] };
export type TextImageLayout = 'imageLeft' | 'imageRight' | 'full' | 'desktopPhones' | 'focus';
export type TextImageBlock = Base & { type: 'textImage'; layout: TextImageLayout; heading: L; body?: L; bullets?: L[]; images: string[]; surface?: Surface };
export type ShowcaseLayout = 'phones' | 'tablets' | 'desktop' | 'desktopPhones' | 'focus';
export type ScreenShowcaseBlock = Base & { type: 'screenShowcase'; layout: ShowcaseLayout; heading?: L; body?: L; images: string[]; surface?: Surface };
export type ImageGalleryBlock = Base & { type: 'imageGallery'; heading?: L; columns?: 2 | 3; images: string[] };
export type FeatureGridBlock = Base & { type: 'featureGrid'; heading: L; intro?: L; items: { title: L; body: L; image?: string }[] };
export type ScopeBlock = Base & { type: 'scope'; heading?: L; note?: L };
/** Only verifiable numbers. `source` says where the figure comes from and is never displayed. */
export type ResultsBlock = Base & { type: 'results'; heading: L; items: { value: string; label: L; source: string }[] };
export type StatementBlock = Base & { type: 'statement'; text: L; sub?: L };

export type Block = CoverBlock | OverviewBlock | ServicesBlock | UserFlowBlock | TextImageBlock | ScreenShowcaseBlock
  | ImageGalleryBlock | FeatureGridBlock | ScopeBlock | ResultsBlock | StatementBlock;
export type BlockType = Block['type'];

/** light = pale accent tint (screens keep their real colours), dark = graphite, accent = brand colour */
export type Surface = 'light' | 'dark' | 'accent';

export type Project = {
  id: string;
  slug: string;
  status: PublishStatus;
  visible: boolean;
  featured: boolean;
  order: number;
  includeInPdf: boolean;
  title: L;
  subtitle: L;
  summary: L;
  overview: L;
  industry?: L;
  categories: Category[];
  platforms: Platform[];
  projectState?: ProjectState;
  year?: number;
  /** "2025.01 – 2025.12" — shown next to the year when given */
  period?: string;
  /** technology names (not translated). Required when the project has no screens: the card and cover show it instead. */
  stack?: string[];
  scope: ScopeItem[];
  /** layout: detail-page variation (web only; PDF keeps one layout). split = default. */
  theme: { accent: string; accentInk: string; cover: 'light' | 'dark'; layout?: PageLayout };
  /** card image(s) on the list page — image ids. [] only for a text-only project (no screens). */
  thumbnail: string[];
  images: Record<string, ImageAsset>;
  blocks: Block[];
  /** internal checklist shown only in review builds */
  reviewNotes?: string[];
};

export type Manifest = { stage: Stage; projects: Project[] };
