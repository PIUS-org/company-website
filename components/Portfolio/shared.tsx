'use client';
/* Small pieces shared by the portfolio pages. */
import { useEffect, type ReactNode, type RefObject } from 'react';
import { RM } from '@/lib/core';

/** Internal link between pages. A plain link: lib/nav.ts turns the move into a page transition
    (header and atmosphere stay, content fades), the same on the real site and in the preview. */
export function NavLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode; 'aria-label'?: string }) {
  return <a href={href} className={className} {...rest}>{children}</a>;
}

/** Adds .is-in to every [data-reveal] inside root once it enters the viewport (no-op with reduced motion). */
/** Reveal [data-reveal] children as they scroll in.
 *  margin — IntersectionObserver rootMargin (default: 10% inside the viewport; the list uses a positive margin so cards are ready before they appear)
 *  stagger — ms between items that come in together (cleared after the entrance so hover transitions stay instant) */
export function useReveal(root: RefObject<HTMLElement | null>, deps: unknown[] = [], opt: { margin?: string; stagger?: number } = {}) {
  useEffect(() => {
    const el = root.current; if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (RM || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
    const timers: number[] = [];
    const io = new IntersectionObserver(es => {
      let k = 0;
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const t = e.target as HTMLElement;
        if (opt.stagger) {
          const d = Math.min(k++, 5) * opt.stagger;
          t.style.transitionDelay = d + 'ms';
          timers.push(window.setTimeout(() => { t.style.transitionDelay = ''; }, d + 1100));
        }
        t.classList.add('is-in'); io.unobserve(t);
      });
    }, { rootMargin: opt.margin || '0px 0px -10% 0px' });
    items.forEach(i => io.observe(i));
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const Arrow = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" /></svg>
);
