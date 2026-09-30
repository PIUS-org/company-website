'use client';
/* Language state (ko / en / ja). Static copy re-renders through useLang().t;
   imperative modules read getLang() and listen for the 'pius:lang' event. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18N, LANGS, Lang, T, setCurrentLang } from '@/lib/i18n';
import { EV, emit, toast } from '@/lib/core';

type Ctx = { lang: Lang; t: (k: string) => string; setLang: (l: Lang, announce?: boolean) => void };
const LangCtx = createContext<Ctx>({ lang: 'ko', t: k => T(k, 'ko'), setLang: () => {} });
export const useLang = (): Ctx => useContext(LangCtx);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');
  /* restore the saved language after hydration (SSR always renders Korean) */
  useEffect(() => {
    try { const s = localStorage.getItem('pius-lang') as Lang | null; if (s && LANGS.includes(s) && s !== 'ko') setLangState(s); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    setCurrentLang(lang);
    document.documentElement.lang = lang;
    document.title = T('meta.title', lang);
    document.querySelector('meta[name="description"]')?.setAttribute('content', T('meta.desc', lang));
    try { localStorage.setItem('pius-lang', lang); } catch { /* storage unavailable */ }
    emit(EV.lang);
    const id = setTimeout(() => emit(EV.resize), 60);
    return () => clearTimeout(id);
  }, [lang]);
  const setLang = useCallback((l: Lang, announce = false) => {
    setLangState(l);
    if (announce) toast({ ko: '한국어', en: 'English', ja: '日本語' }[l]);
  }, []);
  const value = useMemo<Ctx>(() => ({ lang, t: (k: string) => I18N[lang]?.[k] ?? I18N.ko[k] ?? k, setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
