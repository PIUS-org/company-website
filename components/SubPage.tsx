'use client';
/* =========================================================
   SubPage — shell for pages other than the main page (/portfolio …).
   Same header, atmosphere, footer and language state as the main page, but none of the main page's
   boot work: no splash, no 3D stage, no hero shader, no section controllers, no forced scroll-to-top.
   Only the shared frame engine runs (header scroll state / progress, atmosphere, footer wordmark).
   ========================================================= */
import { useEffect, type ReactNode } from 'react';
import { Engine, EV, Scroller, bindPointer, emit, on } from '@/lib/core';
import { bindPageLeave, readArrival } from '@/lib/nav';
import { LangProvider, useLang, type PageMeta } from './LangProvider';
import Atmosphere from './Atmosphere/Atmosphere';
import Header, { type HeaderRoute } from './Header/Header';
import Footer from './Footer/Footer';

function SkipLink() {
  const { t } = useLang();
  return <a className="skip" href="#main">{t('skip')}</a>;
}

function SubBoot() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('is-locked', 'is-leaving');
    /* a page always opens at its top (a #hash target is the only exception) */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) scrollTo(0, 0);
    /* arrived from another page of the site: the header is already there, only the content fades in */
    if (readArrival()) { root.classList.add('is-arriving'); setTimeout(() => root.classList.remove('is-arriving'), 900); }
    const offLeave = bindPageLeave();
    bindPointer();
    Engine.start();
    /* in-page anchors (#top, #main …): eased scroll like the main page */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1), el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault(); emit('pius:navigate'); Scroller.toEl(el);
    };
    const onMove = (e: PointerEvent) => {
      const b = (e.target as Element).closest<HTMLElement>('.btn'); if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    };
    document.addEventListener('click', onClick);
    document.addEventListener('pointermove', onMove, { passive: true });
    const onLoad = () => { Engine.measure(); emit(EV.resize); };
    addEventListener('load', onLoad);
    const offLang = on(EV.lang, () => setTimeout(() => Engine.measure(), 80));
    return () => {
      document.removeEventListener('click', onClick); document.removeEventListener('pointermove', onMove);
      removeEventListener('load', onLoad); offLang(); offLeave(); Engine.stop();
    };
  }, []);
  return null;
}

export default function SubPage({ route, meta, children }: { route: HeaderRoute; meta?: PageMeta; children: ReactNode }) {
  return (
    <LangProvider meta={meta}>
      <SkipLink />
      <Atmosphere />
      <Header route={route} />
      <main id="main">{children}</main>
      <Footer />
      <SubBoot />
    </LangProvider>
  );
}
