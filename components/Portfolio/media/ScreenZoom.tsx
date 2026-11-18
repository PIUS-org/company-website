'use client';
/* Tap / click a portfolio screen to see it at a readable size.
   Web detail page only (the PDF never mounts this). The image is never cropped or re-rendered:
   the same file is shown larger — fitted to the window when that is big enough, otherwise at
   its 1:1 logical size (half the 2x capture width) inside a scrollable panel the reader can pan. */
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../../LangProvider';
import s from './ScreenZoom.module.css';

type Shot = { src: string; alt: string; cap: string; kind: string; w: number; h: number };
const MIN_READ = { mobile: 340, other: 1100 }; // below this a screen is shown at 1:1 and panned

export default function ScreenZoom({ root, deps }: { root: RefObject<HTMLElement | null>; deps: unknown[] }) {
  const { t } = useLang();
  const [shot, setShot] = useState<Shot | null>(null);
  const [width, setWidth] = useState(0);
  const back = useRef<HTMLElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);

  const open = useCallback((fig: HTMLElement) => {
    const img = fig.querySelector('img');
    if (!img) return;
    back.current = fig;
    setShot({
      src: img.currentSrc || img.src, alt: img.alt,
      cap: fig.querySelector('figcaption')?.textContent || '',
      kind: fig.dataset.kind || 'desktop', w: img.naturalWidth || Number(img.getAttribute('width')), h: img.naturalHeight || Number(img.getAttribute('height')),
    });
  }, []);

  /* mark every real screen on the page as a zoom button (not the next-project teaser link) */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const figs = [...el.querySelectorAll<HTMLElement>('figure[data-img]:not([data-empty])')].filter(f => !f.closest('a') && f.querySelector('img'));
    figs.forEach(f => {
      f.dataset.zoom = '';
      f.tabIndex = 0;
      f.setAttribute('role', 'button');
      f.setAttribute('aria-label', `${t('pf.zoom.open')}: ${f.querySelector('img')?.alt || ''}`);
    });
    const onClick = (e: MouseEvent) => { const f = (e.target as HTMLElement).closest<HTMLElement>('figure[data-zoom]'); if (f && el.contains(f)) open(f); };
    const onKey = (e: KeyboardEvent) => {
      const f = (e.target as HTMLElement).closest?.<HTMLElement>('figure[data-zoom]');
      if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(f); }
    };
    el.addEventListener('click', onClick); el.addEventListener('keydown', onKey);
    return () => { el.removeEventListener('click', onClick); el.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, t, ...deps]);

  /* size: fit the window when the fitted screen is still readable, otherwise 1:1 with panning */
  useEffect(() => {
    if (!shot) return;
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const logical = shot.kind === 'mobile' ? Math.min(shot.w / 3, 430) : shot.w / 2;
      const fitted = Math.min(vw - 32, (vh - 120) * (shot.w / shot.h), logical);
      const min = shot.kind === 'mobile' ? MIN_READ.mobile : MIN_READ.other;
      setWidth(fitted >= Math.min(min, logical) ? fitted : Math.min(logical, shot.kind === 'mobile' ? vw - 32 : logical));
    };
    fit();
    window.addEventListener('resize', fit);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    close.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShot(null); };
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('resize', fit); window.removeEventListener('keydown', esc);
      document.documentElement.style.overflow = prev;
      back.current?.focus();
    };
  }, [shot]);

  if (!shot) return null;
  const panned = typeof window !== 'undefined' && width > window.innerWidth - 32;
  /* rendered on <body>: the page wrapper is its own stacking context, so the fixed header would sit on top */
  return createPortal(
    <div className={s.ov} role="dialog" aria-modal="true" aria-label={shot.alt} onClick={e => { if (e.target === e.currentTarget) setShot(null); }}>
      <button ref={close} type="button" className={s.x} onClick={() => setShot(null)} aria-label={t('pf.zoom.close')}><span aria-hidden="true">×</span></button>
      <div className={s.pan} data-panned={panned ? '' : undefined} onClick={e => { if (e.target === e.currentTarget) setShot(null); }}>
        <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} style={{ width }} className={s.img} data-kind={shot.kind} />
      </div>
      {(shot.cap || panned) && <p className={s.cap}>{shot.cap}{panned && <small>{t('pf.zoom.pan')}</small>}</p>}
    </div>,
    document.body,
  );
}
