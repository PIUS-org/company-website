'use client';
/* =========================================================
   Site — composes the page and runs the boot sequence:
   start at the hero → build the 3D stage → splash → intro → unlock scroll.
   ========================================================= */
import { useEffect, useRef } from 'react';
import { Engine, EV, Registry, Scroller, bindPointer, emit, on } from '@/lib/core';
import { createStage } from '@/lib/stage';
import { bindPageLeave, introSeen, markIntroSeen, readArrival } from '@/lib/nav';
import { createHeroBG } from '@/lib/heroBg';
import { LangProvider, useLang } from './LangProvider';
import Atmosphere from './Atmosphere/Atmosphere';
import HeroStage from './Hero/HeroStage';
import Splash, { type SplashHandle } from './Splash/Splash';
import Header from './Header/Header';
import Hero from './Hero/Hero';
import About from './About/About';
import Understand from './Understand/Understand';
import Build from './Build/Build';
import Process from './Process/Process';
import Contact from './Contact/Contact';
import Works from './Works/Works';
import type { Project } from '@/lib/portfolio/types';
import Footer from './Footer/Footer';

function SkipLink() {
  const { t } = useLang();
  return <a className="skip" href="#main">{t('skip')}</a>;
}

function Boot({ splash }: { splash: React.RefObject<SplashHandle | null> }) {
  useEffect(() => {
    /* always start at the hero. A section hash (e.g. /#business from the portfolio header) is
       remembered and scrolled to once the intro has finished. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const arrival = location.hash.slice(1);
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollTo(0, 0);
    bindPointer();

    const stage = createStage();
    Registry.heroRect = stage.rect; Registry.measureHeroTop = stage.measureTop;
    const bg = createHeroBG(stage.rect);
    const offs: (() => void)[] = [Engine.tick(null, (t, dt) => { bg.update(t, dt); stage.update(t, dt); })];

    /* in-page links: eased scroll, close the mobile menu, focus the form on "contact" */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1), el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      emit('pius:navigate');
      Scroller.toEl(el);
      if (id === 'contact') setTimeout(() => document.getElementById('f-name')?.focus({ preventScroll: true }), 1300);
    };
    /* buttons: the inner light follows the cursor */
    const onMove = (e: PointerEvent) => {
      const b = (e.target as Element).closest<HTMLElement>('.btn'); if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    };
    document.addEventListener('click', onClick);
    document.addEventListener('pointermove', onMove, { passive: true });
    offs.push(() => document.removeEventListener('click', onClick), () => document.removeEventListener('pointermove', onMove));

    let cancelled = false;
    offs.push(bindPageLeave());
    /* the splash plays once per visit; coming back from another page of the site goes straight to the intro */
    const returning = !!readArrival() || introSeen();
    const go = () => {
      if (cancelled) return;
      Engine.start();
      emit(EV.resize);                       /* headline fit + stage anchors, now that everything is mounted */
      stage.start();
      const run = returning ? splash.current?.skip.bind(splash.current) : splash.current?.play.bind(splash.current);
      markIntroSeen();
      run?.(() => {
        stage.intro(); bg.start();
        emit(EV.intro);
        setTimeout(() => {
          document.documentElement.classList.remove('is-locked'); scrollTo(0, 0);
          const el = arrival && arrival !== 'top' ? document.getElementById(arrival) : null;
          if (el) setTimeout(() => {
            Scroller.toEl(el);
            if (arrival === 'contact') setTimeout(() => document.getElementById('f-name')?.focus({ preventScroll: true }), 1300);
          }, 250);
        }, returning ? 150 : 700);
      });
    };
    const ready = document.fonts?.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve();
    ready.then(() => requestAnimationFrame(go));
    const onLoad = () => Engine.measure();
    addEventListener('load', onLoad);
    offs.push(() => removeEventListener('load', onLoad), on(EV.lang, () => setTimeout(() => Engine.measure(), 80)));
    return () => { cancelled = true; offs.forEach(f => f()); Engine.stop(); };
  }, [splash]);
  return null;
}

export default function Site({ projects = [] }: { projects?: Project[] }) {
  const works = projects.length > 0;
  const splash = useRef<SplashHandle>(null);
  return (
    <LangProvider>
      <SkipLink />
      <HeroStage />
      <Atmosphere />
      <Splash ref={splash} />
      <Header works={works} />
      <main id="main">
        <Hero />
        <About />
        <Understand />
        <Build />
        <Process />
        {works && <Works projects={projects} />}
        <Contact />
      </main>
      <Footer />
      <Boot splash={splash} />
    </LangProvider>
  );
}
