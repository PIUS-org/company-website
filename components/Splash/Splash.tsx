'use client';
/* Splash — the mark assembles along its isometric axes, a beam passes through,
   then it flies to the hero position and becomes the glass object. */
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { MARK, MARK_VB, TAG_VB, WORD_VB } from '@/lib/logo';
import { RM, Registry } from '@/lib/core';
import { MarkPaths, TagPaths, WordPaths } from '../Logo';
import s from './Splash.module.css';

export type SplashHandle = { play(onExit: () => void): void };
const KEYS = ['u', 'bar', 's', 'p'] as const;
const FROM: Record<string, [number, number]> = { u: [-16, 9], bar: [18, -10], s: [16, 9], p: [0, -18] };

const Splash = forwardRef<SplashHandle>(function Splash(_, ref) {
  const root = useRef<HTMLDivElement>(null), mark = useRef<SVGSVGElement>(null), sweep = useRef<SVGPolygonElement>(null);
  const wm = useRef<SVGSVGElement>(null), tag = useRef<SVGSVGElement>(null), skip = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => ({
    play(onExit: () => void) {
      const r = root.current!, mk = mark.current!, pieces = Array.from(mk.querySelectorAll<SVGGElement>('[data-k]'));
      const anims: Animation[] = [];
      let exiting = false;
      const fill = (g: Element) => g.querySelector<SVGPathElement>('[data-fill]')!;
      const line = (g: Element) => g.querySelector<SVGPathElement>('[data-line]')!;
      const exit = () => {
        if (exiting) return; exiting = true;
        anims.forEach(a => a.finish());
        const target = Registry.heroRect ? Registry.heroRect() : null;
        r.classList.add('is-out');
        onExit();
        if (target && !RM) {
          const b = mk.getBoundingClientRect();
          const sc = target.s / b.height;
          const dx = target.cx - (b.left + b.width / 2), dy = target.cy - (b.top + b.height / 2);
          mk.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px,${dy}px) scale(${sc})`, opacity: 1, offset: .75 },
            { transform: `translate(${dx}px,${dy}px) scale(${sc})`, opacity: 0 },
          ], { duration: 1500, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
          pieces.forEach(g => fill(g).animate([{ opacity: 1 }, { opacity: .12 }], { duration: 1100, delay: 250, easing: 'ease-in-out', fill: 'forwards' }));
        }
        setTimeout(() => r.classList.add('is-gone'), 1600);
      };
      document.documentElement.classList.add('is-locked');
      if (RM) {
        pieces.forEach(g => { fill(g).style.opacity = '1'; });
        wm.current!.style.clipPath = 'none'; tag.current!.style.opacity = '1';
        setTimeout(exit, 700);
        return;
      }
      const opt = (d: number, delay: number, easing = 'cubic-bezier(.16,1,.3,1)'): KeyframeAnimationOptions => ({ duration: d, delay, easing, fill: 'both' });
      pieces.forEach((g, i) => {
        const [x, y] = FROM[g.dataset.k!] || [0, 0];
        anims.push(g.animate([{ transform: `translate(${x}px,${y}px)`, opacity: 0 }, { transform: 'translate(0,0)', opacity: 1 }], opt(900, 60 + i * 90)));
        anims.push(line(g).animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], opt(900, 60 + i * 90, 'cubic-bezier(.65,0,.35,1)')));
        anims.push(fill(g).animate([{ opacity: 0 }, { opacity: 1 }], opt(700, 620 + i * 70)));
      });
      anims.push(sweep.current!.animate([{ transform: 'translateX(-60px)' }, { transform: 'translateX(300px)' }], { duration: 1100, delay: 1050, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }));
      anims.push(wm.current!.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], opt(900, 900, 'cubic-bezier(.65,0,.35,1)')));
      anims.push(tag.current!.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], opt(800, 1300)));
      setTimeout(exit, 2250);
      skip.current!.tabIndex = 0;
      skip.current!.addEventListener('click', exit, { once: true });
      r.addEventListener('click', exit, { once: true });
      addEventListener('keydown', exit, { once: true });
    },
  }), []);
  return (
    <div className={s.splash} ref={root} aria-hidden="true">
      <div className={s.splash__stage}>
        <svg className={s.splash__mark} ref={mark} viewBox={MARK_VB}>
          <defs>
            <clipPath id="spClip"><MarkPaths /></clipPath>
            <linearGradient id="spSweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#bfd6ff" stopOpacity="0" />
              <stop offset=".45" stopColor="#bfd6ff" stopOpacity=".55" />
              <stop offset=".5" stopColor="#ffffff" stopOpacity="1" />
              <stop offset=".55" stopColor="#bfd6ff" stopOpacity=".55" />
              <stop offset="1" stopColor="#bfd6ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {MARK.map((d, i) => (
            <g key={KEYS[i]} className={s.sp} data-k={KEYS[i]}>
              <path className={s.sp__fill} data-fill="" d={d} />
              <path className={s.sp__line} data-line="" d={d} pathLength={1} />
            </g>
          ))}
          <g clipPath="url(#spClip)"><polygon ref={sweep} points="60,180 150,180 110,410 20,410" fill="url(#spSweep)" /></g>
        </svg>
        <div className={s.splash__word}>
          <svg className={s.splash__wm} ref={wm} viewBox={WORD_VB}><WordPaths /></svg>
          <svg className={s.splash__tag} ref={tag} viewBox={TAG_VB}><TagPaths /></svg>
        </div>
      </div>
      <button className={s.splash__skip} ref={skip} type="button" tabIndex={-1}>Skip</button>
    </div>
  );
});
export default Splash;
