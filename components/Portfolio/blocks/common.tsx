/* Shared bits for detail-page blocks. */
import type { Lang } from '@/lib/i18n';
import type { Block, L, Project, Surface } from '@/lib/portfolio/types';
import { tx } from '@/lib/portfolio/text';
import s from '../Project.module.css';

export type BlockProps<B extends Block> = { b: B; p: Project; lang: Lang };

export function SecHead({ b, heading, intro, lang, wide }: { b: Block; heading?: L; intro?: L; lang: Lang; wide?: boolean }) {
  if (!b.section && !heading && !intro) return null;
  return (
    <header className={`${s.head} ${wide ? s['head--wide'] : ''}`} data-reveal="">
      {b.section && <p className={s.idx}>{b.section.index && <span>{b.section.index}</span>}{b.section.label}</p>}
      {heading && <h2 className={s.h2}>{tx(heading, lang)}</h2>}
      {intro && <p className={s.intro}>{tx(intro, lang)}</p>}
    </header>
  );
}

export const surfaceClass = (v?: Surface) => (v ? s[`sf-${v}`] : '');
/** text with \n line breaks */
export const Lines = ({ text }: { text: string }) => <>{text.split('\n').map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>)}</>;

/* Japanese display titles: break only between words (Intl.Segmenter), never inside "コラボレーション".
   The title uses keep-all, so the <wbr>s below are its only break points besides spaces and punctuation.
   The size is computed from the longest word, so a long katakana compound can never push the title off screen. */
const jaSeg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;
const KATA = /^[\u30A0-\u30FF\uFF66-\uFF9F]+$/;
/** word segments; the segmenter splits some katakana words wrongly ("スマート|ファクト|リー"),
    so pieces are rejoined: one that cannot start a word ("ー…", small kana) joins the word before,
    a stray 1–2 character piece joins the word after, and short neighbours join while ≤8 characters
    ("スマートファクトリー", "セレクト|ファッション", "コラボレーション|ワークスペース") */
function jaSegments(t: string): { s: string; w: boolean }[] {
  if (!jaSeg) return [{ s: t, w: true }];
  const segs = [...jaSeg.segment(t)].map(x => ({ s: x.segment, w: !!x.isWordLike }));
  const kata = (x?: { s: string; w: boolean }) => !!x && x.w && KATA.test(x.s);
  const out: { s: string; w: boolean }[] = [];
  for (let i = 0; i < segs.length; i++) {
    const cur = { ...segs[i] }, last = out[out.length - 1], next = segs[i + 1];
    if (kata(cur) && kata(last)) {
      /* a piece that cannot start a word ("ー…", small kana: "リー" in スマートファクト|リー) joins the word before */
      if (/^[ーァィゥェォッャュョヮヵヶ]/.test(cur.s)) { last.s += cur.s; continue; }
    }
    if (kata(cur) && cur.s.length <= 2 && kata(next)) { next.s = cur.s + next.s; continue; } /* "コ|マース" → "コマース" */
    if (kata(cur) && cur.s.length <= 2 && kata(last)) { last.s += cur.s; continue; } /* word-final piece: "ファクト|リー" */
    if (kata(cur) && kata(last) && last.s.length + cur.s.length <= 8) { last.s += cur.s; continue; }
    out.push(cur);
  }
  return out;
}
export const jaWords = (t: string) => jaSegments(t).filter(x => x.w).map(x => x.s);
export function jaBreakable(t: string) {
  if (!jaSeg) return t;
  const out: React.ReactNode[] = []; let prevWord = false;
  jaSegments(t).forEach((x, i) => {
    if (x.w && prevWord) out.push(<wbr key={'w' + i} />);
    out.push(x.s); prevWord = x.w;
  });
  return out;
}

/* Estimated width of a Latin word in em for the display face (measured: caps ≈ .78–.92em, M/W wider,
   i/l/t/f/r narrow), with 8% slack. Used to cap display title sizes so the longest word always fits. */
export const latinEm = (w: string) => 1.08 * [...w].reduce((n, ch) =>
  n + (/[MW]/.test(ch) ? 1.15 : /[A-Z]/.test(ch) ? .86 : /[mw]/.test(ch) ? .95 : /[iljtfr]/.test(ch) ? .38 : /[a-z0-9]/.test(ch) ? .7 : /[\u3040-\u9fff\uac00-\ud7af]/.test(ch) ? 1.02 : .5), 0);
