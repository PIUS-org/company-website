'use client';
/* Fixed atmosphere: scroll-linked tone + slow light drift + grain + cursor light */
import { useEffect, useRef } from 'react';
import { Engine, FINE, PTR, clamp, lerp } from '@/lib/core';
import s from './Atmosphere.module.css';

export default function Atmosphere() {
  const glow = useRef<HTMLDivElement>(null), cl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const g = glow.current!, c = cl.current!;
    let cx = PTR.x, cy = PTR.y;
    return Engine.tick(null, (_t, dt) => {
      const sy = scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const k = Math.sin(clamp(sy / max) * Math.PI);           /* 0 at top/bottom, 1 mid-page */
      g.style.setProperty('--tone', `rgb(${Math.round(7 * k)},${Math.round(9 * k)},${Math.round(13 * k)})`);
      const a = sy / innerHeight;
      g.style.setProperty('--ax', (58 + 28 * Math.sin(a * .55)).toFixed(1) + '%');
      g.style.setProperty('--ay', (28 + 22 * Math.cos(a * .42)).toFixed(1) + '%');
      g.style.setProperty('--bx', (30 - 18 * Math.sin(a * .33)).toFixed(1) + '%');
      g.style.setProperty('--ai', (.035 + .03 * k).toFixed(3));
      if (FINE) {
        cx = lerp(cx, PTR.x, 1 - Math.pow(.001, dt)); cy = lerp(cy, PTR.y, 1 - Math.pow(.001, dt));
        c.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
        c.classList.toggle('on', PTR.active && sy > innerHeight * .6);
      }
    });
  }, []);
  return (
    <>
      <div className={s.atmos} aria-hidden="true"><div ref={glow} className={s.atmos__glow} /><div className={s.atmos__grain} /></div>
      <div ref={cl} className={s['cursor-light']} aria-hidden="true" />
    </>
  );
}
