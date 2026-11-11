'use client';
/* Language state (ko / en / ja). Static copy re-renders through useLang().t;
   imperative modules read getLang() and listen for the 'pius:lang' event. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18N, LANGS, Lang, T, setCurrentLang, glue } from '@/lib/i18n';
import { EV, emit, toast } from '@/lib/core';

type Ctx = { lang: Lang; t: (k: string) => string; setLang: (l: Lang, announce?: boolean) => void };
const LangCtx = createContext<Ctx>({ lang: 'ko', t: k => T(k, 'ko'), setLang: () => {} });
export const useLang = (): Ctx => useContext(LangCtx);

/** meta: per-page title / description (sub pages). Without it the main page's copy is used, as before. */
export type PageMeta = (t: (k: string) => string, lang: Lang) => { title: string; desc?: string };

export function LangProvider({ children, meta }: { children: ReactNode; meta?: PageMeta }) {
  const [lang, setLangState] = useState<Lang>('ko');
  /* restore the saved language after hydration (SSR always renders Korean) */
  useEffect(() => {
    try { const s = localStorage.getItem('pius-lang') as Lang | null; if (s && LANGS.includes(s) && s !== 'ko') setLangState(s); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    setCurrentLang(lang);
    document.documentElement.lang = lang;
    const m = meta?.(k => T(k, lang), lang);
    document.title = m ? m.title : T('meta.title', lang);
    /* sub pages: Next's streamed metadata can write the Korean <title> back right after hydration —
       keep the title of the current language */
    let mo: MutationObserver | undefined;
    if (m) {
      mo = new MutationObserver(() => { if (document.title !== m.title) document.title = m.title; });
      mo.observe(document.head, { subtree: true, childList: true, characterData: true });
    }
    document.querySelector('meta[name="description"]')?.setAttribute('content', m?.desc ?? T('meta.desc', lang));
    try { localStorage.setItem('pius-lang', lang); } catch { /* storage unavailable */ }
    emit(EV.lang);
    const id = setTimeout(() => emit(EV.resize), 60);
    return () => { clearTimeout(id); mo?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  const setLang = useCallback((l: Lang, announce = false) => {
    setLangState(l);
    if (announce) toast({ ko: '한국어', en: 'English', ja: '日本語' }[l]);
  }, []);
  const value = useMemo<Ctx>(() => ({ lang, t: (k: string) => glue(I18N[lang]?.[k] ?? I18N.ko[k] ?? k), setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
