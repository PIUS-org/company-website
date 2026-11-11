'use client';
/* PORTFOLIO on the main page (between Process and Contact).
   No project results here. What we have built is shown as counters per category (computed from the
   published data); every tile is a door into /portfolio, already filtered to that category.
   A quiet text link covers "see everything". Rendered only when at least one project is published. */
import { type ReactNode, useEffect, useRef } from 'react';
import { onceInView, RM } from '@/lib/core';
import { paths } from '@/lib/paths';
import { CATEGORIES, type Category, type Project } from '@/lib/portfolio/types';
import { useLang } from '../LangProvider';
import { Arrow, NavLink } from '../Portfolio/shared';
import s from './Works.module.css';

const TITLE = 'Built to Work.';
const OFFSETS = TITLE.split(' ').reduce<number[]>((acc, w, i, a) => { acc.push(i ? acc[i - 1] + a[i - 1].length : 0); return acc; }, []);

/** English display names (the localised ones come from pf.cat.*) */
const EN: Record<Category, string> = { mobile: 'Mobile App', web: 'Web', erp: 'ERP', platform: 'Platform', commerce: 'Commerce', integration: 'Integration' };
/** tile order on the main page */
const ORDER: Category[] = ['mobile', 'web', 'platform', 'erp', 'commerce', 'integration'];

/** line icons drawn in the same thin ice stroke as the Process orbit */
const ICON: Record<Category, ReactNode> = {
  mobile: <><rect x="17" y="6" width="30" height="52" rx="7" /><path d="M28 11.5h8" /><path d="M24 22h16M24 29h11M24 36h16" /><circle cx="32" cy="50" r="2.2" /></>,
  web: <><rect x="5" y="11" width="54" height="42" rx="5" /><path d="M5 20h54" /><circle cx="11" cy="15.5" r="1.3" /><circle cx="16" cy="15.5" r="1.3" /><path d="M12 28h20M12 34h14" /><rect x="38" y="27" width="14" height="18" rx="2" /></>,
  platform: <><circle cx="32" cy="32" r="7" /><circle cx="11" cy="14" r="5" /><circle cx="53" cy="14" r="5" /><circle cx="32" cy="56" r="5" /><path d="M15 17.5l11.5 9M49 17.5l-11.5 9M32 39v12" /></>,
  erp: <><rect x="7" y="9" width="50" height="46" rx="5" /><path d="M7 21h50M7 33h50M7 45h50M23 9v46" /><path d="M12 27l2.5 2.5L19 25M12 39l2.5 2.5L19 37" /></>,
  commerce: <><path d="M12 21h40l-4 33H16z" /><path d="M23 25v-7a9 9 0 0 1 18 0v7" /><path d="M24 38h16" /></>,
  integration: <><rect x="5" y="22" width="20" height="20" rx="5" /><rect x="39" y="22" width="20" height="20" rx="5" /><path d="M25 28h14M33 24l6 4-6 4" /><path d="M39 37H25M31 33l-6 4 6 4" /></>,
};

export function worksTiles(projects: Project[]) {
  return ORDER.filter(c => (CATEGORIES as readonly string[]).includes(c))
    .map(c => ({ cat: c, value: projects.filter(p => p.categories.includes(c)).length }))
    .filter(x => x.value > 0);
}

const pad = (n: number) => String(n).padStart(2, '0');
function countUp(el: HTMLElement, to: number, delay: number) {
  if (RM) { el.textContent = pad(to); return; }
  const dur = 1500, t0 = performance.now() + delay;
  const tick = (now: number) => {
    const k = Math.min(1, Math.max(0, (now - t0) / dur));
    el.textContent = pad(Math.round(to * (1 - Math.pow(1 - k, 4))));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function Works({ projects }: { projects: Project[] }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const tiles = worksTiles(projects);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const offs = [
      onceInView(document.getElementById('worksTitle'), x => x.classList.add('is-in')),
      onceInView(el.querySelector('[data-tiles]'), box => {
        box.classList.add('is-in');
        box.querySelectorAll<HTMLElement>('[data-to]').forEach((n, i) => countUp(n, +n.dataset.to!, 260 + i * 120));
      }),
    ];
    /* soft light that follows the pointer inside a tile */
    const move = (e: PointerEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-tile]');
      if (!tile) return;
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', move);
    return () => { offs.forEach(f => f()); el.removeEventListener('pointermove', move); };
  }, []);

  return (
    <section className={`sec ${s.works}`} id="works" ref={root} aria-labelledby="worksTitle">
      <div className={`wrap ${s.head}`}>
        <div>
          <div className="sec-idx">Portfolio</div>
          <h2 className={`${s.title} disp`} id="worksTitle" style={{ marginTop: 22 }}>
            {TITLE.split(' ').map((w, wi, arr) => (
              <span key={wi}><span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {w.split('').map((ch, i) => <span key={i} className={s.ch} style={{ transitionDelay: (OFFSETS[wi] + i) * 22 + 'ms' }}>{ch}</span>)}
              </span>{wi < arr.length - 1 ? ' ' : ''}</span>
            ))}
          </h2>
        </div>
        <div className={s.side}>
          <p className={s.lead}>{t('works.lead')}</p>
          <NavLink href={paths.portfolio()} className={s.all}>
            <span>{t('works.all')}</span><b>{pad(projects.length)}</b><Arrow />
          </NavLink>
        </div>
      </div>

      <ul className={`wrap ${s.tiles}`} data-tiles="" data-n={tiles.length}>
        {tiles.map((x, i) => (
          <li key={x.cat} style={{ ['--i' as string]: i }}>
            <NavLink href={paths.portfolio(`#${x.cat}`)} className={s.tile} data-tile=""
              aria-label={`${t(`pf.cat.${x.cat}`)} ${x.value} — ${t('works.all')}`}>
              <span className={s.tile__top}>
                <svg className={s.tile__icon} viewBox="0 0 64 64" aria-hidden="true">{ICON[x.cat]}</svg>
                <span className={s.tile__go} aria-hidden="true"><Arrow /></span>
              </span>
              <span className={s.tile__n} aria-hidden="true"><span data-to={x.value}>{RM ? pad(x.value) : '00'}</span></span>
              <span className={s.tile__lbl}>
                <b>{EN[x.cat]}</b>
                {lang !== 'en' && <small>{t(`pf.cat.${x.cat}`)}</small>}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
