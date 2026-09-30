'use client';
/* ABOUT — the statement lights up word by word; five glass layers separate as you scroll.
   Behind it, the 3D stage lets P / I / U / S drift on their own orbits (lib/stage). */
import { useEffect, useRef, type ReactNode } from 'react';
import { Engine, E, isMobile, lerp, range } from '@/lib/core';
import { useLang } from '../LangProvider';
import s from './About.module.css';

const STATEMENT = 'Every business works differently.';
const PLATES: { k: string; en: string; icon: ReactNode }[] = [
  { k: 'env', en: 'Environment', icon: <path d="M10 80h80M10 60h80M10 40h80M10 20h80" /> },
  { k: 'legacy', en: 'Legacy', icon: <><rect x="14" y="14" width="30" height="30" rx="3" /><rect x="56" y="14" width="30" height="30" rx="3" /><rect x="14" y="56" width="30" height="30" rx="3" /><rect x="56" y="56" width="30" height="30" rx="3" /></> },
  { k: 'process', en: 'Process', icon: <><circle cx="20" cy="20" r="5" /><circle cx="50" cy="50" r="5" /><circle cx="80" cy="80" r="5" /><circle cx="80" cy="24" r="5" /><path d="M24 24l22 22M54 54l22 22M54 46l22-18" /></> },
  { k: 'way', en: 'Way of work', icon: <path d="M20 30c20 0 20 40 40 40s20-40 30-40M10 50c20 0 30-30 50-30s20 60 30 60" /> },
  { k: 'org', en: 'Organization', icon: <><circle cx="50" cy="22" r="6" /><circle cx="26" cy="70" r="6" /><circle cx="50" cy="70" r="6" /><circle cx="74" cy="70" r="6" /><path d="M50 28v14M26 64V50h48v14M50 50v14" /></> },
];

export default function About() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null), big = useRef<HTMLHeadingElement>(null), stack = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ws = Array.from(big.current!.querySelectorAll<HTMLElement>('[data-w]'));
    const st = stack.current!, plates = Array.from(st.querySelectorAll<HTMLElement>('[data-pl]'));
    const faces = plates.map(p => p.querySelector<HTMLElement>('[data-face]')!);
    let gap = 0;
    const off1 = Engine.scene(root.current!, p => {
      ws.forEach((w, i) => w.classList.toggle('on', p > .14 + i * .035));
      const g = lerp(6, isMobile() ? 38 : 58, E.out3(range(p, .12, .42)));
      if (Math.abs(g - gap) > .1) { gap = g; st.style.setProperty('--gap', g.toFixed(2) + 'px'); }
      plates.forEach((pl, i) => pl.style.setProperty('--lo', range(p, .22 + i * .025, .34 + i * .025).toFixed(3)));
    });
    const off2 = Engine.tick(root.current!, tt => {
      faces.forEach((f, i) => f.style.setProperty('--sweep', (((tt * .16 + (4 - i) * .07) % 1.6) * 180 - 100).toFixed(1) + '%'));
    });
    return () => { off1(); off2(); };
  }, []);
  return (
    <section className={`sec ${s.about}`} id="about" ref={root}>
      <div className={`wrap ${s.about__grid}`}>
        <div className={s.about__copy}>
          <div className="sec-idx">About PIUS</div>
          <h2 className={`${s.about__big} disp`} ref={big} style={{ marginTop: 22 }}>
            {STATEMENT.split(' ').map((w, i) => <span key={i}><span data-w="" className={s.w}>{w}</span>{' '}</span>)}
          </h2>
          <div className={s.about__sub}><p>{t('about.p1')}</p><p>{t('about.p2')}</p></div>
        </div>
        <div className={s.about__stack} ref={stack} aria-hidden="true">
          {PLATES.map((p, i) => (
            <div key={p.k} data-pl="" className={`${s.pl} ${i === 4 ? s['pl--top'] : ''}`} style={{ ['--i' as string]: i }}>
              <div className={s.pl__face} data-face=""><svg viewBox="0 0 100 100">{p.icon}</svg></div>
              <span className={s.pl__lbl}><span><b>{t('pl.' + p.k)}</b><em>{p.en}</em></span></span>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap">
        <div className={s.about__id}><p>{t('about.id1')}</p><p>{t('about.id2')}</p></div>
      </div>
    </section>
  );
}
