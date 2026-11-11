'use client';
/* /portfolio — intro, project count, category filter (sliding pill like the header) and the card grid. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, type Category, type Project } from '@/lib/portfolio/types';
import { EV, on, onceInView } from '@/lib/core';
import { leadsByFilter, withLead } from '@/lib/portfolio/text';
import { useLang } from '../LangProvider';
import PortfolioCard from './PortfolioCard';
import { useReveal } from './shared';
import s from './List.module.css';

type Filter = 'all' | Category;
/* cards shown before "더 보기": the lead card takes two cells, so 11 cards fill four rows of three (and six of two) */
const PAGE = 12;
const FIRST = PAGE - 1;
/* columns of the grid (same breakpoints as List.module.css) */
const colsNow = () => (typeof window === 'undefined' ? 3 : window.innerWidth <= 899 ? 1 : window.innerWidth <= 1199 ? 2 : 3);
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Lead card: the first card of every tab spans two columns (on "all" this is the featured project).
 * The last card widens when the last row would otherwise be left with empty cells.
 */
function spanOf(i: number, n: number, cols: number): 'lead' | 'fill2' | 'fill3' | undefined {
  if (cols === 1) return undefined;
  if (i === 0 && n > 1) return 'lead';
  if (i !== n - 1 || n < 2) return undefined;
  const cells = n + 1; /* the lead takes one extra cell */
  const r = cells % cols;
  if (!r) return undefined;
  return cols === 3 ? (r === 1 ? 'fill3' : 'fill2') : 'fill2';
}

export default function PortfolioList({ projects }: { projects: Project[] }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Filter>('all');
  const root = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null), pill = useRef<HTMLSpanElement>(null);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c, projects.filter(p => p.categories.includes(c)).length])) as Record<Category, number>, [projects]);
  const [limit, setLimit] = useState(FIRST);
  const [cols, setCols] = useState(3);
  useEffect(() => { const f = () => setCols(colsNow()); f(); return on(EV.resize, f); }, []);
  /* each tab opens with a different project (see leadsByFilter) */
  const leads = useMemo(() => leadsByFilter(projects, (['all', ...CATEGORIES] as Filter[]).filter(f => f !== 'all')), [projects]);
  const matched = withLead(filter === 'all' ? projects : projects.filter(p => p.categories.includes(filter)), leads[filter]);
  const shown = matched.slice(0, limit);

  /* remember the filter in the URL hash (#platform …) so a filtered view can be shared or restored */
  useEffect(() => {
    const h = location.hash.slice(1) as Filter;
    if ((CATEGORIES as readonly string[]).includes(h)) setFilter(h);
  }, []);
  const pick = (f: Filter) => {
    setFilter(f); setLimit(FIRST);
    try { history.replaceState(null, '', f === 'all' ? location.pathname + location.search : `#${f}`); } catch { /* sandboxed */ }
  };

  /* sliding pill under the active filter */
  useIso(() => {
    const place = () => {
      const b = bar.current?.querySelector<HTMLElement>('[aria-pressed="true"]'), p = pill.current;
      if (!b || !p) return;
      p.style.width = b.offsetWidth + 'px'; p.style.height = b.offsetHeight + 'px';
      p.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`; p.style.opacity = '1';
    };
    place();
    const offs = [on(EV.resize, place), on(EV.lang, () => setTimeout(place, 30))];
    document.fonts?.ready.then(place);
    return () => offs.forEach(f => f());
  }, [filter, lang]);

  useReveal(root, [filter, lang, limit]);
  useEffect(() => onceInView(document.getElementById('pfTitle'), el => el.classList.add('is-in'), '0px'), []);

  return (
    <div className={s.page} ref={root}>
      <section className={`${s.intro} wrap`} id="top" aria-labelledby="pfTitle">
        <p className="sec-idx">{t('pf.eyebrow')}</p>
        <div className={s.intro__row}>
          <h1 className={`${s.intro__title} ${s['intro__title--one']} disp`} id="pfTitle" aria-label={t('pf.title')}>
            {/* same letter-by-letter entrance as the main page's section titles */}
            {t('pf.title').split('').map((ch, i) => <span key={i} className={s.ch} aria-hidden="true" style={{ transitionDelay: i * 28 + 'ms' }}>{ch}</span>)}
          </h1>
          <div className={s.intro__side}>
            <p className={s.intro__lead}>{t('pf.lead')}</p>
            <p className={s.intro__count}><b>{String(projects.length).padStart(2, '0')}</b><span>{t('pf.count')}</span></p>
          </div>
        </div>
        <div className={s.filter} ref={bar} role="group" aria-label={t('pf.filter')}>
          <span className={s.filter__pill} ref={pill} aria-hidden="true" />
          {(['all', ...CATEGORIES] as Filter[]).map(f => {
            const n = f === 'all' ? projects.length : counts[f];
            return (
              <button key={f} type="button" aria-pressed={filter === f} className={n ? '' : s['filter--zero']} onClick={() => pick(f)}>
                {t(`pf.cat.${f}`)}<sup>{n}</sup>
              </button>
            );
          })}
        </div>
      </section>

      <section className={`${s.grid} wrap`} aria-live="polite">
        {shown.map((p, i) => <PortfolioCard key={p.slug} p={p} lang={lang} eager={i < 3} index={i} span={spanOf(i, shown.length, cols)} />)}
        {!shown.length && <p className={s.empty}>{t(projects.length ? 'pf.empty' : 'pf.emptyAll')}</p>}
      </section>
      {matched.length > limit && (
        <div className={`wrap ${s.more}`}>
          <button type="button" className="btn btn--glass" onClick={() => setLimit(l => l + PAGE)}>
            <span>{t('pf.more')}</span><sup className={s.more__n}>{matched.length - limit}</sup>
          </button>
        </div>
      )}
    </div>
  );
}
