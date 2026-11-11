'use client';
/* Reads ?format=a4|169 (page size) and ?mode=full|external (edition), and sets the page size (@page + page box) before the PDF is printed.
   Also sets <html lang> so Japanese pages use the Japanese font stack. */
import { useEffect } from 'react';
import type { Lang } from '@/lib/i18n';
import { FORMATS, type PrintFormat as F } from '@/lib/portfolio/print';

export default function PrintFormat({ lang }: { lang: Lang }) {
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('format');
    const f: F = q === '169' ? '169' : 'a4';
    const doc = document.getElementById('pfDoc');
    doc?.setAttribute('data-format', f);
    doc?.setAttribute('data-mode', new URLSearchParams(location.search).get('mode') === 'external' ? 'external' : 'full');
    document.documentElement.lang = lang;
    document.documentElement.classList.add('is-print');
    const st = document.createElement('style');
    st.textContent = `@page{ size:${FORMATS[f].w} ${FORMATS[f].h}; margin:0; }`;
    document.head.appendChild(st);
    document.documentElement.dataset.printReady = '1';
    return () => st.remove();
  }, [lang]);
  return null;
}
