'use client';
/* Fixed black header: nav with sliding active pill, scroll progress, CTA, language switch,
   mobile full-screen menu and the toast used for small confirmations.
   route="home"      : sections of the main page (#about …), active pill follows the scroll
   route="portfolio" : same header on /portfolio pages; section links go back to the main page,
                       the pill stays on Portfolio and the header is shown right away (no splash there). */
import { useEffect, useRef, useState } from 'react';
import { Engine, EV, on, clamp } from '@/lib/core';
import { LANGS, Lang } from '@/lib/i18n';
import { LOCKUP_VB } from '@/lib/logo';
import { paths } from '@/lib/paths';
import { readArrival } from '@/lib/nav';
import { useLang } from '../LangProvider';
import { LockupPaths } from '../Logo';
import s from './Header.module.css';

/** home: main page · portfolio: /portfolio pages (pill on Portfolio) · page: any other page (no active item) */
export type HeaderRoute = 'home' | 'portfolio' | 'page';
const NAV: [string, string][] = [['about', 'About'], ['business', 'Business'], ['process', 'Process'], ['portfolio', 'Portfolio']];
/* active-pill sections on the main page. "contact" has no menu item any more (the CTA covers it),
   so reaching the contact section simply hides the pill. */
const MAP_BASE: [string, string[]][] = [['about', ['about', 'understand']], ['business', ['business']], ['process', ['process']], ['contact', ['contact']]];
/* with published projects the main page has a Works section (#works): Portfolio then scrolls there like the other items */
const MAP_WORKS: [string, string[]][] = [['about', ['about', 'understand']], ['business', ['business']], ['process', ['process']], ['portfolio', ['works']], ['contact', ['contact']]];
const hrefFor = (id: string, route: HeaderRoute, works = false) =>
  id === 'portfolio' ? (route === 'home' && works ? '#works' : paths.portfolio()) : route === 'home' ? `#${id}` : paths.home(`#${id}`);
const LABEL: Record<Lang, [string, string]> = { ko: ['KO', '한국어'], en: ['EN', 'English'], ja: ['JP', '日本語'] };

function LangSwitch({ onPick }: { onPick?: () => void }) {
  const { lang, setLang } = useLang();
  return (
    <div className={s.lang} role="group" aria-label="Language">
      {LANGS.map((l, i) => (
        <span key={l} style={{ display: 'contents' }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          <button type="button" lang={l} aria-label={LABEL[l][1]} aria-pressed={lang === l} className={lang === l ? 'is-on' : ''}
            onClick={() => { if (l !== lang) setLang(l, true); onPick?.(); }}>{LABEL[l][0]}</button>
        </span>
      ))}
    </div>
  );
}

export default function Header({ route = 'home', works = false }: { route?: HeaderRoute; works?: boolean }) {
  const { t } = useLang();
  const home = route === 'home';
  const MAP = works ? MAP_WORKS : MAP_BASE;
  const hdr = useRef<HTMLElement>(null), bar = useRef<HTMLElement>(null), pill = useRef<HTMLSpanElement>(null), nav = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ m: string; k: number } | null>(null);
  const [toastOn, setToastOn] = useState(false);

  /* header show (after the splash), scrolled state, progress, active pill */
  useEffect(() => {
    const h = hdr.current!, b = bar.current!, p = pill.current!, links = Array.from(nav.current!.querySelectorAll<HTMLAnchorElement>('a'));
    let tops: [string, number][] = [], current: string | null = null;
    const place = (key: string | null) => {
      const a = links.find(l => l.dataset.nav === key);
      if (!a) { p.style.opacity = '0'; return; }
      p.style.opacity = '1'; p.style.width = a.offsetWidth + 'px'; p.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    const activate = (key: string | null) => { current = key; links.forEach(l => l.classList.toggle('is-active', l.dataset.nav === key)); place(key); };
    const measure = () => {
      if (home) tops = MAP.map(([k, ids]) => [k, Math.min(...ids.map(id => document.getElementById(id)!.getBoundingClientRect().top + scrollY))]);
      if (home || current) place(current);
    };
    /* arrived from another page: start the pill where it was, then let it slide to the current item */
    const prev = readArrival()?.pill;
    if (prev) {
      p.style.transition = 'none'; p.style.opacity = '1'; p.style.width = prev.w + 'px'; p.style.transform = `translateX(${prev.x}px)`;
      void p.offsetWidth; p.style.transition = '';
    }
    if (!home) requestAnimationFrame(() => requestAnimationFrame(() => activate(route)));
    measure();
    const offs = [
      on(EV.resize, measure),
      home ? on(EV.intro, () => setTimeout(() => h.classList.add('is-in'), 450)) : (() => { const id = setTimeout(() => h.classList.add('is-in'), 60); return () => clearTimeout(id); })(),
      Engine.tick(null, () => {
        const sy = scrollY;
        h.classList.toggle('is-scrolled', sy > 8);
        b.style.transform = `scaleX(${clamp(sy / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
        if (!home) return;
        let key: string | null = null; const probe = sy + innerHeight * .42;
        for (const [k, top] of tops) if (probe >= top) key = k;
        if (key !== current) activate(key);
      }),
    ];
    if (!home && document.fonts?.ready) document.fonts.ready.then(() => place(current));
    return () => offs.forEach(f => f());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home, route, works]);

  /* mobile menu: lock scroll, close on Esc / on in-page navigation */
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', open);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const close = () => setOpen(false);
    addEventListener('keydown', esc); addEventListener('pius:navigate', close);
    return () => { removeEventListener('keydown', esc); removeEventListener('pius:navigate', close); };
  }, [open]);

  /* toast */
  useEffect(() => on(EV.toast, e => { setToastMsg({ m: String((e as CustomEvent).detail), k: Date.now() }); setToastOn(true); }), []);
  useEffect(() => { if (!toastMsg) return; const id = setTimeout(() => setToastOn(false), 2600); return () => clearTimeout(id); }, [toastMsg]);

  return (
    <>
      <header className={s.hdr} id="hdr" ref={hdr}>
        <div className={s.hdr__in}>
          <a className={s.hdr__logo} href={home ? '#top' : paths.home()} aria-label="PIUS">
            <svg viewBox={LOCKUP_VB} role="img" aria-hidden="true"><LockupPaths /></svg>
          </a>
          <nav className={s.hdr__nav} ref={nav} aria-label="Main">
            <span className={s.hdr__pill} ref={pill} aria-hidden="true" />
            {NAV.map(([id, label]) => <a key={id} href={hrefFor(id, route, works)} data-nav={id} aria-current={!home && id === route ? 'page' : undefined}>{label}</a>)}
          </nav>
          <div className={s.hdr__act}>
            <a className={s['btn-cta']} href={hrefFor('contact', route)}>{t('nav.cta')}</a>
            <LangSwitch />
            <button className={s.hdr__menu} type="button" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(v => !v)}>
              <span /><span /><span className="sr">{t(open ? 'menu.close' : 'menu.open')}</span>
            </button>
          </div>
        </div>
        <div className={s.hdr__progress} aria-hidden="true"><i ref={bar} /></div>
      </header>

      <div className={`${s.mnav} ${open ? 'is-open' : ''}`} id="mnav" aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map(([id, label]) => <a key={id} href={hrefFor(id, route, works)} aria-current={!home && id === route ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className={s.mnav__foot}>
          <a className="btn btn--solid" href={hrefFor('contact', route)}><span>{t('cta.project')}</span></a>
          <LangSwitch onPick={() => setOpen(false)} />
        </div>
      </div>

      <div className={`${s.toast} ${toastOn ? 'is-on' : ''}`} role="status" aria-live="polite">{toastMsg?.m}</div>
    </>
  );
}
