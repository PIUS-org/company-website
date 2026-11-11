/* Internal URLs. On the real site these are plain routes.
   The Claude preview is a flat static export (every page is a root-level .html file, see scripts/preview-build.mjs),
   so there the same helpers return relative file names. NEXT_PUBLIC_PIUS_PREVIEW is only set by the preview build. */
const PREVIEW = process.env.NEXT_PUBLIC_PIUS_PREVIEW === '1';

export const paths = {
  /** main page, optionally a section: home('#contact') */
  home: (hash = '') => (PREVIEW ? `index.html${hash}` : `/${hash}`),
  /** portfolio list, optionally pre-filtered: portfolio('#mobile') */
  portfolio: (hash = '') => (PREVIEW ? `portfolio.html${hash}` : `/portfolio${hash}`),
  project: (slug: string) => (PREVIEW ? `portfolio-${slug}.html` : `/portfolio/${slug}`),
  print: (slug: string, lang: string) => (PREVIEW ? `portfolio-${slug}-print-${lang}.html` : `/portfolio/${slug}/print/${lang}`),
};
/** files under public/ */
export const asset = (src: string) => (PREVIEW ? src.replace(/^\//, '') : src);
