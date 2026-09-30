'use client';
/* HERO — headline (letters bulge under the cursor like a convex lens), copy, CTAs, ticker.
   The glass cube and background are drawn by <HeroStage> + lib/stage + lib/heroBg. */
import { Fragment, useEffect, useRef } from 'react';
import { Engine, EV, FINE, PTR, RM, Registry, lerp, on, scramble } from '@/lib/core';
import { MARK_VB } from '@/lib/logo';
import { useLang } from '../LangProvider';
import { MarkPaths } from '../Logo';
import s from './Hero.module.css';

const WORDS = ['ERP systems', 'business platforms', 'web systems', 'mobile apps', 'integrations'];
const LINES: [string, boolean][] = [['Build', true], ['Your', true], ['Growth', false]];

export default function Hero() {
  const { t } = useLang();
  const hero = useRef<HTMLElement>(null), title = useRef<HTMLHeadingElement>(null), content = useRef<HTMLDivElement>(null), now = useRef<HTMLElement>(null);

  /* intro: lines rise after the splash; overflow opens once they have landed (lens needs room) */
  useEffect(() => on(EV.intro, () => {
    setTimeout(() => hero.current?.classList.add('is-in'), 450);
    setTimeout(() => hero.current?.classList.add('is-revealed'), 2000);
  }), []);

  /* "We build ___" ticker */
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { if (scrollY < innerHeight && !document.hidden && now.current) { i = (i + 1) % WORDS.length; scramble(now.current, WORDS[i], 800); } }, 2800);
    return () => clearInterval(id);
  }, []);

  /* headline fits the space left of the glass mark */
  useEffect(() => {
    const ti = title.current!, lines = Array.from(ti.querySelectorAll<HTMLElement>('[data-ln]'));
    const fit = () => {
      ti.style.fontSize = '';
      const base = parseFloat(getComputedStyle(ti).fontSize), left = ti.getBoundingClientRect().left;
      let avail: number;
      if (innerWidth >= 900 && Registry.heroRect) { const r = Registry.heroRect(); avail = r.cx - r.s * .5 - 36 - left; }
      else avail = document.documentElement.clientWidth - left * 2;
      const rows: Record<number, number> = {};
      lines.forEach(l => { const w = (l.firstElementChild as HTMLElement).getBoundingClientRect().width; const k = Math.round(l.getBoundingClientRect().top); rows[k] = (rows[k] || 0) + w; });
      const widest = Math.max(...Object.values(rows)) + (innerWidth >= 900 ? base * .25 : 0);
      if (widest > avail) ti.style.fontSize = Math.max(34, base * avail / widest) + 'px';
      Registry.measureHeroTop?.();
    };
    fit();
    return on(EV.resize, fit);
  }, []);

  /* convex-lens letters */
  useEffect(() => {
    const h = hero.current!, ti = title.current!, ct = content.current!;
    const chs = Array.from(ti.querySelectorAll<HTMLElement>('[data-ch]')).map(el => ({ el, x: 0, y: 0, f: 0 }));
    let fs = 100, onK = 0;
    const measure = () => {
      fs = parseFloat(getComputedStyle(ti).fontSize);
      chs.forEach(c => {
        let x = c.el.offsetLeft + c.el.offsetWidth / 2, y = c.el.offsetTop + c.el.offsetHeight * .55;
        let n = c.el.offsetParent as HTMLElement | null;
        while (n && n !== ct) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
        c.x = x; c.y = y;
      });
    };
    const id = setTimeout(measure, 300);
    const offR = on(EV.resize, () => setTimeout(measure, 80));
    const offS = Engine.scene(h, (_p, _t, dt) => {
      if (RM || !h.classList.contains('is-in')) return;
      const cr = ct.getBoundingClientRect();
      const px = PTR.x - cr.left, py = PTR.y - cr.top;
      const recent = FINE ? PTR.active : performance.now() - PTR.t < 1400;
      const inHero = PTR.y < h.getBoundingClientRect().bottom;
      onK = lerp(onK, recent && inHero ? 1 : 0, 1 - Math.pow(.02, dt));
      const R = fs * 1.15, k = 1 - Math.pow(.0008, dt);
      chs.forEach(c => {
        const dx = c.x - px, dy = c.y - py;
        const target = onK * Math.exp(-(dx * dx + dy * dy) / (R * R));
        c.f = lerp(c.f, target, k);
        if (c.f < .002 && target < .002) { if (c.el.style.transform) { c.el.style.transform = ''; c.el.style.fontVariationSettings = ''; c.el.style.textShadow = ''; } return; }
        const f = c.f, d = Math.hypot(dx, dy) || 1, push = Math.min(d, R) / d * f * fs * .16;
        c.el.style.transform = `translate3d(${(dx * push / R * 1.6).toFixed(2)}px,${(dy * push / R * 1.6).toFixed(2)}px,0) scale(${(1 + .38 * f).toFixed(3)})`;
        c.el.style.fontVariationSettings = `"wght" ${Math.round(300 + 260 * f)}`;
        c.el.style.textShadow = `0 0 ${(30 * f).toFixed(1)}px rgba(191,214,255,${(.55 * f).toFixed(3)}), 0 2px 40px rgba(0,0,0,.6)`;
      });
    });
    return () => { clearTimeout(id); offR(); offS(); };
  }, []);

  return (
    <section className={s.hero} id="top" ref={hero} aria-label="PIUS">
      <svg className={s.hero__fallback} id="heroFallback" viewBox={MARK_VB} aria-hidden="true">
        <defs><linearGradient id="fbG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".5" stopColor="#bfd6ff" stopOpacity=".06" /><stop offset="1" stopColor="#fff" stopOpacity=".16" /></linearGradient></defs>
        <g fill="url(#fbG)" stroke="rgba(255,255,255,.45)" strokeWidth=".4"><MarkPaths /></g>
      </svg>
      <div className={s.hero__shade} aria-hidden="true" />
      <div className={`${s.hero__content} wrap`} id="heroContent" ref={content}>
        <h1 className={`${s.hero__title} disp`} id="heroTitle" ref={title}>
          {LINES.map(([w, inline]) => (
            <Fragment key={w}>
              <span data-ln="" className={`${s.ln} ${inline ? s['ln--inline'] : ''}`}>
                <span>{w.split('').map((c, i) => <span key={i} data-ch="" className={s.ch}>{c}</span>)}</span>
              </span>{' '}
            </Fragment>
          ))}
        </h1>
        <p className={s.hero__sub}>{t('hero.sub')}</p>
        <div className={s.hero__cta}>
          <a className="btn btn--solid" href="#contact"><span>{t('cta.project')}</span><svg className="btn__arr" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9h11M10 5l4 4-4 4" /></svg></a>
          <a className="btn btn--glass" href="#about"><span>{t('hero.more')}</span></a>
        </div>
      </div>
      <div className={`${s.hero__foot} wrap`} id="heroFoot" aria-hidden="true">
        <span className={s.hero__scroll}><i />Scroll</span>
        <span className={s.hero__now}><span>We build</span><b ref={now}>ERP systems</b></span>
      </div>
    </section>
  );
}
